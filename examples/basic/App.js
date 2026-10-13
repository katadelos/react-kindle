import React, {useState} from 'react';
import {
  Button, Checkbox, Dialog, Divider, Notebook, Page, ProgressBar,
  RadioGroup, SettingsRow, Slider, StarRating, Switch, TabBar,
  Text, TextField, View,
} from 'react-kindle';

function Preferences() {
  const [name, setName] = useState('Reading');
  const [archived, setArchived] = useState(false);
  const [covers, setCovers] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <View style={{paddingTop: 20}}>
      <TextField label="List name" value={name} onChangeText={setName}
        hint="Choose a name for your reading list." />
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
        <Checkbox value={archived} onValueChange={setArchived}
          accessibilityLabel="Include archived books"
          style={{width: 44, height: 44, marginRight: 16}} />
        <Text>Include archived books</Text>
      </View>
      <SettingsRow title="Show covers" description="Display book covers in the list.">
        <Switch value={covers} onValueChange={setCovers}
          accessibilityLabel="Show covers" style={{width: 88, height: 44}} />
      </SettingsRow>
      <Button disabled={!name.trim()} style={{marginTop: 24}}
        onPress={() => setSaved(true)}>Save preferences</Button>
      <Dialog visible={saved} title="Preferences saved" cancelLabel=""
        onConfirm={() => setSaved(false)} onDismiss={() => setSaved(false)}>
        {`${name.trim()}: ${archived ? 'all books' : 'active books only'}, covers ${covers ? 'on' : 'off'}.`}
      </Dialog>
    </View>
  );
}

function Controls() {
  const [level, setLevel] = useState(12);
  const [sort, setSort] = useState('recent');

  return (
    <View style={{paddingTop: 20}}>
      <Text variant="title">Reading goal: {level} books</Text>
      <Slider value={level} minimumValue={1} maximumValue={24} onValueChange={setLevel} />
      <Text variant="caption">Goal progress</Text>
      <ProgressBar value={level / 24 * 100} style={{width: '100%', marginVertical: 12}} />
      <Divider style={{marginVertical: 12}} />
      <Text variant="title">Sort books</Text>
      <RadioGroup value={sort} onValueChange={setSort} options={[
        {value: 'recent', label: 'Recent'},
        {value: 'title', label: 'Title'},
      ]} />
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 16}}>
        <Text style={{marginRight: 16}}>Reader rating</Text>
        <StarRating value={3.5} />
      </View>
      <Button variant="secondary" onPress={() => {setLevel(12); setSort('recent');}}>
        Reset controls
      </Button>
    </View>
  );
}

export default function App() {
  const [page, setPage] = useState('preferences');
  return (
    <View style={{flex: 1, padding: 24, backgroundColor: '#FFFFFF'}}>
      <Text variant="h2" style={{marginBottom: 12}}>Component gallery</Text>
      <TabBar value={page} onValueChange={setPage} tabs={[
        {value: 'preferences', label: 'Preferences'},
        {value: 'controls', label: 'Controls'},
      ]} />
      <Notebook page={page}>
        <Page name="preferences"><Preferences /></Page>
        <Page name="controls"><Controls /></Page>
      </Notebook>
    </View>
  );
}
