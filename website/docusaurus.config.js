module.exports = {
  title: 'React Kindle',
  tagline: 'Build Kindle apps with native controls',
  url: process.env.DOCS_URL || 'http://localhost:3000',
  baseUrl: process.env.DOCS_BASE_URL || '/',
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  presets: [['classic', {
    docs: {path: '../docs', routeBasePath: '/', sidebarPath: require.resolve('./sidebars.js')},
    blog: false,
    theme: {customCss: require.resolve('./src/css/custom.css')},
  }]],
  themeConfig: {
    colorMode: {defaultMode: 'light', disableSwitch: true},
    navbar: {title: 'React Kindle', items: [
      {to: '/', label: 'Get started', position: 'left'},
      {to: '/components', label: 'Components', position: 'left'},
    ]},
    docs: {sidebar: {hideable: true}},
    prism: {additionalLanguages: ['bash', 'json']},
  },
};
