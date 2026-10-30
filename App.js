import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, SafeAreaView
} from 'react-native';

const THEMES = {
  cyber: {
    name: '⚡ Cyber Neon',
    bg: '#0b0c10',
    panel: '#151722',
    taste: '#1f2233',
    tasteSpezial: '#2b304c',
    akzent: '#00f0ff',
    akzentText: '#000000',
    zweitAkzent: '#ff007f',
    text: '#ffffff',
    subText: '#8b92b2',
  },
  gruvbox: {
    name: '🦊 Gruvbox Dark',
    bg: '#1d2021',
    panel: '#282828',
    taste: '#3c3836',
    tasteSpezial: '#504945',
    akzent: '#d79921',
    akzentText: '#1d2021',
    zweitAkzent: '#458588',
    text: '#ebdbb2',
    subText: '#a89984',
  },
  matrix: {
    name: '💻 Matrix Hacker',
    bg: '#050805',
    panel: '#0c140c',
    taste: '#122212',
    tasteSpezial: '#1b361b',
    akzent: '#00ff41',
    akzentText: '#000000',
    zweitAkzent: '#008f11',
    text: '#d0ffd6',
    subText: '#4d8855',
  },
  ocean: {
    name: '🌊 Deep Ocean',
    bg: '#0a1118',
    panel: '#12202f',
    taste: '#1b2e42',
    tasteSpezial: '#27415c',
    akzent: '#38bdf8',
    akzentText: '#0a1118',
    zweitAkzent: '#f43f5e',
    text: '#f0f9ff',
    subText: '#7dd3fc',
  }
};

export default function App() {
  const [tab, setTab] = useState('rechner'); // rechner | einheiten | tools | design
  const [themeKey, setThemeKey] = useState('cyber');
  const theme = THEMES[themeKey];

  // --- RECHNER STATES ---
  const [ausdruck, setAusdruck] = useState('');
  const [liveErgebnis, setLiveErgebnis] = useState('');
  const [verlauf, setVerlauf] = useState([]);
  const [zeigeWissenschaftlich, setZeigeWissenschaftlich] = useState(true);

  // --- EINHEITEN STATES ---
  const [einheitKat, setEinheitKat] = useState('tempo');
  const [einheitWert, setEinheitWert] = useState('10');

  // --- TOOLS STATES (Coder / Dreisatz / Zufall) ---
  const [dezimalZahl, setDezimalZahl] = useState('255');
  const [dreisatzA, setDreisatzA] = useState('100');
  const [dreisatzB, setDreisatzB] = useState('25');
  const [dreisatzC, setDreisatzC] = useState('60');
  const [minZufall, setMinZufall] = useState('1');
  const [maxZufall, setMaxZufall] = useState('100');
  const [zufallsErgebnis, setZufallsErgebnis] = useState(null);

  // Gespeichertes Theme & Verlauf laden
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = window.localStorage.getItem('konsti_theme');
        const savedHistory = window.localStorage.getItem('konsti_history');
        if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);
        if (savedHistory) setVerlauf(JSON.parse(savedHistory));
      }
    } catch (e) {}
  }, []);

  const wechsleTheme = (key) => {
    setThemeKey(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('konsti_theme', key);
      }
    } catch (e) {}
  };

  // Sichere Auswertung von mathematischen Ausdrücken
  const werteAus = (str) => {
    if (!str) return '';
    try {
      let formel = str
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `(${Math.PI})`)
        .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/√([0-9.]+)/g, 'Math.sqrt($1)')
        .replace(/sin\(([^)]+)\)/g, 'Math.sin(($1)*Math.PI/180)')
        .replace(/cos\(([^)]+)\)/g, 'Math.cos(($1)*Math.PI/180)')
        .replace(/tan\(([^)]+)\)/g, 'Math.tan(($1)*Math.PI/180)')
        .replace(/\^/g, '**');

      // Offene Klammern für Live-Vorschau automatisch schließen
      const offene = (formel.match(/\(/g) || []).length;
      const geschlossene = (formel.match(/\)/g) || []).length;
      if (offene > geschlossene) {
        formel += ')'.repeat(offene - geschlossene);
      }

      if (/[^0-9+\-*/().MathsqrtincosaPI\s]/.test(formel)) return '';
      // eslint-disable-next-line no-new-func
      const erg = Function(`"use strict"; return (${formel})`)();
      if (erg === undefined || isNaN(erg) || !isFinite(erg)) return '';
      const gerundet = Math.round(erg * 1e9) / 1e9;
      return String(gerundet);
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    const erg = werteAus(ausdruck);
    setLiveErgebnis(erg !== ausdruck ? erg : '');
  }, [ausdruck]);

  const tippeZeichen = (z) => {
    setAusdruck((prev) => prev + z);
  };

  const loescheLetztes = () => {
    setAusdruck((prev) => prev.slice(0, -1));
  };

  const allesLoeschen = () => {
    setAusdruck('');
    setLiveErgebnis('');
  };

  const rechneAus = () => {
    const erg = werteAus(ausdruck);
    if (!erg) return;
    const neuerEintrag = { rechnung: ausdruck, ergebnis: erg };
    const neuerVerlauf = [neuerEintrag, ...verlauf.slice(0, 9)];
    setVerlauf(neuerVerlauf);
    setAusdruck(erg);
    setLiveErgebnis('');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('konsti_history', JSON.stringify(neuerVerlauf));
      }
    } catch (e) {}
  };

  const Taste = ({ label, onPress, farbe, textFarbe, flex = 1, klein = false }) => (
    <TouchableOpacity
      style={[
        styles.taste,
        {
          backgroundColor: farbe || theme.taste,
          flex: flex,
          height: klein ? 42 : 58,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.tastenText,
          { color: textFarbe || theme.text, fontSize: klein ? 16 : 23 }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // --- BERECHNUNGEN FÜR TOOLS ---
  const numEinheit = parseFloat(einheitWert.replace(',', '.')) || 0;
  const numDezimal = parseInt(dezimalZahl, 10);
  const dreisatzErgebnis = (() => {
    const a = parseFloat(dreisatzA);
    const b = parseFloat(dreisatzB);
    const c = parseFloat(dreisatzC);
    if (!a || isNaN(b) || isNaN(c)) return '-';
    return Math.round(((b / a) * c) * 1000) / 1000;
  })();

  const zieheZufall = () => {
    const min = parseInt(minZufall, 10) || 0;
    const max = parseInt(maxZufall, 10) || 100;
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    const r = Math.floor(Math.random() * (high - low + 1)) + low;
    setZufallsErgebnis(r);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* OBEN: NAVIGATION */}
      <View style={[styles.navBar, { backgroundColor: theme.panel }]}>
        {[
          { id: 'rechner', label: '🧮 Rechner' },
          { id: 'einheiten', label: '🚀 Einheiten' },
          { id: 'tools', label: '🛠️ Tools' },
          { id: 'design', label: '🎨 Design' },
        ].map((item) => {
          const aktiv = tab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navBtn,
                aktiv && { backgroundColor: theme.akzent }
              ]}
              onPress={() => setTab(item.id)}
            >
              <Text
                style={[
                  styles.navText,
                  { color: aktiv ? theme.akzentText : theme.subText }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ==================== TAB 1: PRO-RECHNER ==================== */}
      {tab === 'rechner' && (
        <View style={styles.rechnerContainer}>
          {/* Anklickbarer Verlauf */}
          <View style={[styles.verlaufBox, { backgroundColor: theme.panel }]}>
            <View style={styles.verlaufHeader}>
              <Text style={{ color: theme.subText, fontSize: 12, fontWeight: 'bold' }}>
                📜 VERLAUF (Antippen zum Einfügen)
              </Text>
              <TouchableOpacity onPress={() => setZeigeWissenschaftlich(!zeigeWissenschaftlich)}>
                <Text style={{ color: theme.akzent, fontSize: 12, fontWeight: 'bold' }}>
                  {zeigeWissenschaftlich ? '🔼 Extras ausblenden' : '🔽 Extras einblenden'}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              {verlauf.length === 0 ? (
                <Text style={{ color: theme.subText, fontSize: 12, fontStyle: 'italic' }}>
                  Noch keine Berechnungen...
                </Text>
              ) : (
                verlauf.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.verlaufChip, { backgroundColor: theme.taste }]}
                    onPress={() => tippeZeichen(item.ergebnis)}
                  >
                    <Text style={{ color: theme.subText, fontSize: 11 }}>{item.rechnung} = </Text>
                    <Text style={{ color: theme.akzent, fontSize: 12, fontWeight: 'bold' }}>
                      {item.ergebnis}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {/* Haupt-Display */}
          <View style={[styles.displayBox, { backgroundColor: theme.panel, borderColor: theme.tasteSpezial }]}>
            <Text
              style={[styles.ausdruckText, { color: theme.text }]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {ausdruck || '0'}
            </Text>
            <Text style={[styles.liveText, { color: theme.akzent }]}>
              {liveErgebnis ? `= ${liveErgebnis}` : ' '}
            </Text>
          </View>

          {/* Wissenschaftliche Zusatz-Leiste */}
          {zeigeWissenschaftlich && (
            <View style={{ marginBottom: 4 }}>
              <View style={styles.reihe}>
                <Taste label="(" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('(')} />
                <Taste label=")" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen(')')} />
                <Taste label="√" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('√(')} />
                <Taste label="x²" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('^2')} />
                <Taste label="xʸ" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('^')} />
              </View>
              <View style={styles.reihe}>
                <Taste label="sin" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('sin(')} />
                <Taste label="cos" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('cos(')} />
                <Taste label="tan" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('tan(')} />
                <Taste label="π" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('π')} />
                <Taste label="00" klein farbe={theme.tasteSpezial} onPress={() => tippeZeichen('00')} />
              </View>
            </View>
          )}

          {/* Haupt-Tastenfeld */}
          <View style={styles.tastenBlock}>
            <View style={styles.reihe}>
              <Taste label="AC" farbe={theme.zweitAkzent} textFarbe="#fff" onPress={allesLoeschen} />
              <Taste label="⌫" farbe={theme.tasteSpezial} onPress={loescheLetztes} />
              <Taste label="%" farbe={theme.tasteSpezial} onPress={() => tippeZeichen('/100')} />
              <Taste label="÷" farbe={theme.akzent} textFarbe={theme.akzentText} onPress={() => tippeZeichen('÷')} />
            </View>
            <View style={styles.reihe}>
              <Taste label="7" onPress={() => tippeZeichen('7')} />
              <Taste label="8" onPress={() => tippeZeichen('8')} />
              <Taste label="9" onPress={() => tippeZeichen('9')} />
              <Taste label="×" farbe={theme.akzent} textFarbe={theme.akzentText} onPress={() => tippeZeichen('×')} />
            </View>
            <View style={styles.reihe}>
              <Taste label="4" onPress={() => tippeZeichen('4')} />
              <Taste label="5" onPress={() => tippeZeichen('5')} />
              <Taste label="6" onPress={() => tippeZeichen('6')} />
              <Taste label="-" farbe={theme.akzent} textFarbe={theme.akzentText} onPress={() => tippeZeichen('-')} />
            </View>
            <View style={styles.reihe}>
              <Taste label="1" onPress={() => tippeZeichen('1')} />
              <Taste label="2" onPress={() => tippeZeichen('2')} />
              <Taste label="3" onPress={() => tippeZeichen('3')} />
              <Taste label="+" farbe={theme.akzent} textFarbe={theme.akzentText} onPress={() => tippeZeichen('+')} />
            </View>
            <View style={styles.reihe}>
              <Taste label="0" flex={2.1} onPress={() => tippeZeichen('0')} />
              <Taste label="." onPress={() => tippeZeichen('.')} />
              <Taste label="=" farbe={theme.akzent} textFarbe={theme.akzentText} onPress={rechneAus} />
            </View>
          </View>
        </View>
      )}

      {/* ==================== TAB 2: EINHEITEN-UMRECHNER ==================== */}
      {tab === 'einheiten' && (
        <ScrollView style={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🚀 Physik & Einheiten-Umrechner
          </Text>

          <View style={styles.reihe}>
            {[
              { id: 'tempo', label: '💨 Tempo' },
              { id: 'laenge', label: '📏 Länge' },
              { id: 'gewicht', label: '⚖️ Masse' },
              { id: 'temp', label: '🌡️ Temp' }
            ].map((k) => (
              <TouchableOpacity
                key={k.id}
                style={[
                  styles.katBtn,
                  { backgroundColor: einheitKat === k.id ? theme.akzent : theme.panel }
                ]}
                onPress={() => setEinheitKat(k.id)}
              >
                <Text style={{ color: einheitKat === k.id ? theme.akzentText : theme.text, fontWeight: 'bold', fontSize: 13 }}>
                  {k.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.panel }]}>
            <Text style={{ color: theme.subText, marginBottom: 6 }}>Ausgangswert eingeben:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bg, color: theme.akzent, borderColor: theme.tasteSpezial }]}
              value={einheitWert}
              onChangeText={setEinheitWert}
              keyboardType="numeric"
            />

            {einheitKat === 'tempo' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} m/s</Text> = {(numEinheit * 3.6).toFixed(2)} km/h
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} km/h</Text> = {(numEinheit / 3.6).toFixed(2)} m/s
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} km/h</Text> = {(numEinheit * 0.621371).toFixed(2)} mph (Meilen/h)
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} km/h</Text> = {(numEinheit / 1.852).toFixed(2)} Knoten
                </Text>
              </View>
            )}

            {einheitKat === 'laenge' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} cm</Text> = {(numEinheit * 10).toFixed(1)} mm | {(numEinheit / 100).toFixed(3)} m
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} cm</Text> = {(numEinheit / 2.54).toFixed(2)} Zoll (Inch)
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} Zoll</Text> = {(numEinheit * 2.54).toFixed(2)} cm
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} km</Text> = {(numEinheit * 0.621371).toFixed(2)} Meilen
                </Text>
              </View>
            )}

            {einheitKat === 'gewicht' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} g</Text> = {(numEinheit / 1000).toFixed(3)} kg
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} kg</Text> = {(numEinheit * 2.20462).toFixed(2)} lbs (Pfund)
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} g</Text> = {(numEinheit * 0.035274).toFixed(2)} oz (Unzen)
                </Text>
              </View>
            )}

            {einheitKat === 'temp' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} °C</Text> = {((numEinheit * 9/5) + 32).toFixed(1)} °F
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} °C</Text> = {(numEinheit + 273.15).toFixed(2)} K (Kelvin)
                </Text>
                <Text style={[styles.ergZeile, { color: theme.text }]}>
                  • <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{numEinheit} °F</Text> = {((numEinheit - 32) * 5/9).toFixed(1)} °C
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ==================== TAB 3: MATHE- & CODER-TOOLS ==================== */}
      {tab === 'tools' && (
        <ScrollView style={styles.scrollContent}>
          {/* Tool 1: Binär & Hex Konverter */}
          <View style={[styles.card, { backgroundColor: theme.panel }]}>
            <Text style={[styles.cardTitle, { color: theme.akzent }]}>
              💻 Coder-Umrechner (Dezimal → Binär & Hex)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.tasteSpezial }]}
              value={dezimalZahl}
              onChangeText={setDezimalZahl}
              keyboardType="numeric"
              placeholder="Dezimalzahl..."
            />
            <Text style={[styles.ergZeile, { color: theme.text, marginTop: 8 }]}>
              Binär (Base 2): <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{!isNaN(numDezimal) ? numDezimal.toString(2) : '-'}</Text>
            </Text>
            <Text style={[styles.ergZeile, { color: theme.text }]}>
              Hexadezimal (Base 16): <Text style={{ color: theme.akzent, fontWeight: 'bold' }}>{!isNaN(numDezimal) ? '0x' + numDezimal.toString(16).toUpperCase() : '-'}</Text>
            </Text>
          </View>

          {/* Tool 2: Dreisatz-Rechner */}
          <View style={[styles.card, { backgroundColor: theme.panel }]}>
            <Text style={[styles.cardTitle, { color: theme.akzent }]}>
              📐 Automatischer Dreisatz-Löser
            </Text>
            <View style={styles.reihe}>
              <TextInput
                style={[styles.inputKlein, { backgroundColor: theme.bg, color: theme.text }]}
                value={dreisatzA}
                onChangeText={setDreisatzA}
                keyboardType="numeric"
                placeholder="A"
              />
              <Text style={{ color: theme.subText, alignSelf: 'center', marginHorizontal: 6 }}>entspricht</Text>
              <TextInput
                style={[styles.inputKlein, { backgroundColor: theme.bg, color: theme.text }]}
                value={dreisatzB}
                onChangeText={setDreisatzB}
                keyboardType="numeric"
                placeholder="B"
              />
            </View>
            <View style={[styles.reihe, { marginTop: 8 }]}>
              <TextInput
                style={[styles.inputKlein, { backgroundColor: theme.bg, color: theme.text }]}
                value={dreisatzC}
                onChangeText={setDreisatzC}
                keyboardType="numeric"
                placeholder="C"
              />
              <Text style={{ color: theme.subText, alignSelf: 'center', marginHorizontal: 6 }}>entspricht</Text>
              <View style={[styles.inputKlein, { backgroundColor: theme.tasteSpezial, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.akzent, fontWeight: 'bold', fontSize: 16 }}>
                  {dreisatzErgebnis}
                </Text>
              </View>
            </View>
          </View>

          {/* Tool 3: Zufallsgenerator */}
          <View style={[styles.card, { backgroundColor: theme.panel }]}>
            <Text style={[styles.cardTitle, { color: theme.akzent }]}>
              🎲 Zufalls-Generator
            </Text>
            <View style={styles.reihe}>
              <TextInput
                style={[styles.inputKlein, { backgroundColor: theme.bg, color: theme.text }]}
                value={minZufall}
                onChangeText={setMinZufall}
                keyboardType="numeric"
                placeholder="Min"
              />
              <Text style={{ color: theme.subText, alignSelf: 'center', marginHorizontal: 8 }}>bis</Text>
              <TextInput
                style={[styles.inputKlein, { backgroundColor: theme.bg, color: theme.text }]}
                value={maxZufall}
                onChangeText={setMaxZufall}
                keyboardType="numeric"
                placeholder="Max"
              />
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.akzent }]}
              onPress={zieheZufall}
            >
              <Text style={{ color: theme.akzentText, fontWeight: 'bold', fontSize: 15 }}>
                Zufallszahl ziehen {zufallsErgebnis !== null ? `👉 ${zufallsErgebnis}` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ==================== TAB 4: DESIGN WÄHLER ==================== */}
      {tab === 'design' && (
        <ScrollView style={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🎨 Wähle dein eigenes App-Design:
          </Text>
          {Object.keys(THEMES).map((key) => {
            const t = THEMES[key];
            const aktiv = themeKey === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: t.panel,
                    borderColor: aktiv ? t.akzent : t.tasteSpezial,
                    borderWidth: 2
                  }
                ]}
                onPress={() => wechsleTheme(key)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: t.text, fontSize: 17, fontWeight: 'bold' }}>{t.name}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={[styles.farbKreis, { backgroundColor: t.akzent }]} />
                    <View style={[styles.farbKreis, { backgroundColor: t.zweitAkzent }]} />
                    <View style={[styles.farbKreis, { backgroundColor: t.taste }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', padding: 6, justifyContent: 'space-around' },
  navBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  navText: { fontSize: 13, fontWeight: 'bold' },
  rechnerContainer: { flex: 1, paddingHorizontal: 10, paddingBottom: 10, justifyContent: 'space-between' },
  verlaufBox: { padding: 8, borderRadius: 10, marginTop: 6 },
  verlaufHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verlaufChip: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 6, marginTop: 4 },
  displayBox: { flex: 1, marginVertical: 8, borderRadius: 14, padding: 14, justifyContent: 'flex-end', alignItems: 'flex-end', borderWidth: 1 },
  ausdruckText: { fontSize: 40, fontWeight: 'bold', textAlign: 'right' },
  liveText: { fontSize: 22, fontWeight: '600', marginTop: 4 },
  tastenBlock: { justifyContent: 'flex-end' },
  reihe: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  taste: { marginHorizontal: 3, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tastenText: { fontWeight: 'bold' },
  scrollContent: { flex: 1, padding: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  katBtn: { flex: 1, paddingVertical: 10, marginHorizontal: 3, borderRadius: 8, alignItems: 'center' },
  card: { padding: 14, borderRadius: 12, marginTop: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  input: { padding: 12, borderRadius: 8, fontSize: 18, fontWeight: 'bold', borderWidth: 1 },
  inputKlein: { flex: 1, padding: 10, borderRadius: 8, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  ergZeile: { fontSize: 15, marginVertical: 4 },
  actionBtn: { marginTop: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  themeCard: { padding: 16, borderRadius: 12, marginBottom: 10 },
  farbKreis: { width: 22, height: 22, borderRadius: 11, marginLeft: 6 }
});
