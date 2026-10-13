#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {spawn, spawnSync, execFileSync} = require('child_process');

const {createRequire} = require('module');

const root = fs.realpathSync(process.cwd());
const projectRequire = createRequire(path.join(root, 'package.json'));
const namePattern = /^[A-Za-z][A-Za-z0-9]*$/;
const firmwarePattern = /^\d+(?:\.\d+)+$/;
const usage = `Usage:
  react-kindle create NAME
  react-kindle build APP_DIRECTORY FIRMWARE
  react-kindle deploy APP_DIRECTORY [--host root@localhost] [--port 2222] [--identity PATH] [--ssh-config PATH] [--launch]`;

function json(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {cwd: root, stdio: 'inherit', ...options});
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.signal || result.status})`);
}

function inside(directory, file) {
  const relative = path.relative(directory, file);
  return relative !== '' && relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}

function readApp(directory) {
  const app = fs.realpathSync(path.resolve(directory));
  if (app !== root && !inside(root, app)) throw new Error('Application must be inside the current project');
  const metadata = JSON.parse(fs.readFileSync(path.join(app, 'app.json'), 'utf8'));
  if (!namePattern.test(metadata.name) || metadata.id !== `com.lab126.${metadata.name}`) {
    throw new Error('Invalid app name or registry identity');
  }
  if (!fs.statSync(path.join(app, 'App.js')).isFile()) throw new Error('Application requires App.js');
  const chrome = metadata.chrome === undefined ? 1 : metadata.chrome;
  if (!Number.isInteger(chrome) || chrome < 0 || chrome > 4) throw new Error('chrome must be 0, 1, 2, 3, or 4');
  const presentation = metadata.presentation ?? null;
  if (![null, 'classic', 'unified'].includes(presentation)) throw new Error('presentation must be classic or unified');
  const plugins = metadata.nativePlugins ?? [];
  if (!Array.isArray(plugins)) throw new Error('nativePlugins must be an array');
  const nativePlugins = plugins.map(plugin => {
    const file = fs.realpathSync(path.resolve(root, plugin));
    if (!inside(root, file) || path.extname(file) !== '.so' || !fs.statSync(file).isFile()) {
      throw new Error(`Native plug-in must be a built .so inside the current project: ${plugin}`);
    }
    return file;
  });
  return {...metadata, app, chrome, presentation, nativePlugins};
}

function create(name) {
  if (!namePattern.test(name)) throw new Error('Name must contain letters and digits, beginning with a letter');
  const app = path.join(root, 'apps', name);
  fs.mkdirSync(path.dirname(app), {recursive: true});
  fs.mkdirSync(app);
  for (const directory of ['res', 'locale']) {
    fs.mkdirSync(path.join(app, directory));
    fs.writeFileSync(path.join(app, directory, '.keep'), '');
  }
  json(path.join(app, 'app.json'), {name, id: `com.lab126.${name}`, chrome: 1});
  fs.writeFileSync(path.join(app, 'App.js'), `import React, {useState} from 'react';
import {Button, Text, View} from 'react-kindle';

export default function App() {
  const [saved, setSaved] = useState(false);
  return (
    <View style={{flex: 1, padding: 24, backgroundColor: '#FFFFFF'}}>
      <Text style={{marginBottom: 24}}>{saved ? 'Saved' : 'Ready'}</Text>
      <Button onPress={() => setSaved(true)}>Save</Button>
    </View>
  );
}
`);
  console.log(`Created apps/${name}. Build with: react-kindle build apps/${name} FIRMWARE`);
}

function build(directory, firmware) {
  if (!firmwarePattern.test(firmware)) throw new Error('Firmware must be a dotted numeric release');
  const {app, name, id, chrome, presentation, nativePlugins} = readApp(directory);
  const platform = process.platform === 'darwin' ? 'osx-bin'
    : process.platform === 'linux' && process.arch === 'x64' ? 'linux64-bin' : null;
  if (!platform) throw new Error('Hermes 0.9.0 requires macOS or Linux x64');
  const compiler = path.join(path.dirname(projectRequire.resolve('hermes-engine/package.json')), platform, 'hermesc');
  const output = path.join(root, 'build', 'apps', name, firmware);
  fs.rmSync(output, {recursive: true, force: true});
  fs.mkdirSync(path.join(output, 'js'), {recursive: true});
  for (const directory of ['res', 'locale']) {
    const source = path.join(app, directory);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(output, directory), {recursive: true});
    else fs.mkdirSync(path.join(output, directory));
  }
  const entry = path.join(output, 'entry.js');
  fs.writeFileSync(entry, `import {registerApplication} from 'react-kindle';
import App, * as application from ${JSON.stringify(path.join(app, 'App.js'))};
registerApplication({
  id: ${JSON.stringify(id)}, firmware: ${JSON.stringify(firmware)}, component: App, chrome: ${chrome},
  onRequestClose: application.onRequestClose, onLayout: application.onWindowLayout, presentation: ${JSON.stringify(presentation)},
});
`);
  const remote = `/mnt/us/extensions/${name}`;
  const plugins = nativePlugins.map(file => {
    fs.mkdirSync(path.join(output, 'lib'), {recursive: true});
    fs.copyFileSync(file, path.join(output, 'lib', path.basename(file)));
    return `/var/local/${name}/lib/${path.basename(file)}`;
  });
  for (const managed of [false, true]) {
    const config = {javascript: `${remote}/js/app.hbc`, res: `${remote}/res`, locale: `${remote}/locale`,
      appmgrd: managed, pmond: false, stackdumpd: true};
    if (plugins.length) config.plugins = plugins;
    json(path.join(output, managed ? 'config.appmgrd' : 'config.dev'), config);
  }
  const manifest = [
    {def: 'interface', assoc: {interface: 'application'}},
    {def: 'handlerId', assoc: {handlerId: id, props: {
      command: `/app/bin/KPPSimpleLauncher --name ${name} -c ${remote}/config.appmgrd`, unloadPolicy: 'unloadOnPause'}}},
    {def: 'association', assoc: {interface: 'application', handlerId: id, contentIds: ['none'], default: 'false'}},
  ];
  fs.writeFileSync(path.join(output, 'application.install'), manifest.map(item => JSON.stringify(item, null, 2)).join(',\n') + '\n');
  json(path.join(output, 'target.json'), {firmware, presentation: presentation || 'auto', name, id});
  const javascript = path.join(output, 'js', 'app.js');
  const bytecode = path.join(output, 'js', 'app.hbc');
  run(process.execPath, [projectRequire.resolve('react-native/cli.js'), 'bundle', '--platform', 'android', '--dev', 'false',
    '--entry-file', entry, '--bundle-output', javascript, '--assets-dest', path.join(output, 'res')]);
  run(compiler, ['-emit-binary', '-O', '-out', bytecode, javascript]);
  const header = fs.readFileSync(bytecode).subarray(0, 12);
  if (header.length !== 12 || header.subarray(0, 8).toString('hex') !== 'c61fbc03c103191f' || header.readUInt32LE(8) !== 84) {
    throw new Error('Expected Hermes bytecode version 84');
  }
  console.log(`Application payload: ${output} (Hermes bytecode 84)`);
  return {output, name, remote};
}

function floatAbi(binary) {
  if (binary.length < 40 || binary.subarray(0, 6).toString('hex') !== '7f454c460101' || binary.readUInt16LE(18) !== 40) {
    throw new Error('Native plug-ins require a 32-bit little-endian ARM target');
  }
  return binary.readUInt32LE(36) & 0x600;
}

async function deploy(directory, args) {
  let host = 'root@localhost', port = '2222', identity, sshConfig, launch = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--launch') launch = true;
    else if (args[index] === '--host' && args[index + 1]) host = args[++index];
    else if (args[index] === '--port' && args[index + 1]) port = args[++index];
    else if (args[index] === '--identity' && args[index + 1]) identity = path.resolve(args[++index]);
    else if (args[index] === '--ssh-config' && args[index + 1]) sshConfig = path.resolve(args[++index]);
    else throw new Error(usage);
  }
  if (host.startsWith('-') || !/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error('Invalid SSH destination');
  }
  const {name} = readApp(directory);
  const ssh = [...(sshConfig ? ['-F', sshConfig] : []), '-p', port, ...(identity ? ['-i', identity] : []), host];
  const capture = command => execFileSync('ssh', [...ssh, command], {maxBuffer: 128 * 1024 * 1024});
  const version = capture('cat /etc/prettyversion.txt').toString();
  const match = version.match(/Kindle\s+(\d+(?:\.\d+)+)/);
  if (!match) throw new Error('Cannot identify target firmware from /etc/prettyversion.txt');
  const probe = `for proc in /proc/[0-9]*/cmdline; do command=$(tr '\\000' ' ' < "$proc" 2>/dev/null) || continue; case "$command" in '/app/bin/KPPSimpleLauncher --name ${name} '*) echo "$proc";; esac; done`;
  if (capture(probe).toString().trim()) throw new Error(`Unload ${name} before deploying`);
  const {output, remote} = build(directory, match[1]);
  const libraryDirectory = path.join(output, 'lib');
  if (fs.existsSync(libraryDirectory)) {
    const target = capture('cat /app/bin/KPPSimpleLauncher');
    const targetAbi = floatAbi(target);
    const stringSymbols = [
      '_ZN11reactNative12nativeModule6method24MethodContainerInterfaceC2ERKSs',
      '_ZN11reactNative12nativeModule6method24MethodContainerInterfaceC2ERKNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEEE',
    ];
    for (const file of fs.readdirSync(libraryDirectory)) {
      const binary = fs.readFileSync(path.join(libraryDirectory, file));
      if (floatAbi(binary) !== targetAbi) throw new Error(`${file}: float ABI differs from the target launcher; rebuild for ${targetAbi === 0x400 ? 'hard' : 'softfp'}`);
      stringSymbols.forEach((symbol, abi) => {
        if (binary.includes(symbol) && !target.includes(symbol)) {
          throw new Error(`${file}: C++ string ABI ${abi} differs from the target launcher; rebuild for ABI ${1 - abi}`);
        }
      });
    }
  }
  run('ssh', [...ssh, `mkdir -p ${remote}`]);
  const files = ['js', 'res', 'locale', 'config.dev', 'config.appmgrd', 'application.install', 'target.json'];
  if (fs.existsSync(libraryDirectory)) files.push('lib');
  const archive = spawn('tar', ['-C', output, '-cf', '-', ...files], {stdio: ['ignore', 'pipe', 'inherit']});
  const transfer = spawn('ssh', [...ssh, `tar -xf - -C ${remote}`], {stdio: ['pipe', 'inherit', 'inherit']});
  const completed = child => new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`Payload transfer failed (${code})`)));
  });
  const pending = Promise.all([completed(archive), completed(transfer)]);
  transfer.stdin.on('error', error => { if (error.code !== 'EPIPE') transfer.kill(); });
  archive.stdout.pipe(transfer.stdin);
  try { await pending; }
  finally { archive.kill(); transfer.kill(); }
  run('ssh', [...ssh, `chmod -R a+rX ${remote}`]);
  if (fs.existsSync(libraryDirectory)) {
    run('ssh', [...ssh, `mkdir -p /var/local/${name}/lib && cp ${remote}/lib/*.so /var/local/${name}/lib/ && chmod -R a+rX /var/local/${name}`]);
  }
  if (launch) {
    run('ssh', [...ssh, `export DISPLAY=:0.0; nohup /app/bin/KPPSimpleLauncher --name ${name} -c ${remote}/config.dev >/tmp/${name}-launch.log 2>&1 </dev/null &`]);
  }
  console.log(`Deployed ${name} for firmware ${match[1]} to ${host}:${remote}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (args.includes('--help') || command === '--help') return console.log(usage);
  if (command === 'create' && args.length === 1) return create(args[0]);
  if (command === 'build' && args.length === 2) return build(...args);
  if (command === 'deploy' && args.length >= 1) return deploy(args[0], args.slice(1));
  throw new Error(usage);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
