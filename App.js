import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  const [anzeige, setAnzeige] = useState('0');
  const [vorherigerWert, setVorherigerWert] = useState(null);
  const [operator, setOperator] = useState(null);
  const [warteAufNeueZahl, setWarteAufNeueZahl] = useState(false);

  const zahlTippen = (ziffer) => {
    if (warteAufNeueZahl) {
      setAnzeige(String(ziffer));
      setWarteAufNeueZahl(false);
    } else {
      setAnzeige(anzeige === '0' ? String(ziffer) : anzeige + ziffer);
    }
  };

  const kommaTippen = () => {
    if (warteAufNeueZahl) {
      setAnzeige('0.');
      setWarteAufNeueZahl(false);
      return;
    }
    if (!anzeige.includes('.')) {
      setAnzeige(anzeige + '.');
    }
  };

  const allesLoeschen = () => {
    setAnzeige('0');
    setVorherigerWert(null);
    setOperator(null);
    setWarteAufNeueZahl(false);
  };

  const vorzeichenWechseln = () => {
    const wert = parseFloat(anzeige);
    if (wert === 0) return;
    setAnzeige(String(wert * -1));
  };

  const prozentRechnen = () => {
    const wert = parseFloat(anzeige);
    setAnzeige(String(wert / 100));
  };

  const berechne = (ersterWert, zweiterWert, op) => {
    switch (op) {
      case '+': return ersterWert + zweiterWert;
      case '-': return ersterWert - zweiterWert;
      case '×': return ersterWert * zweiterWert;
      case '÷': return zweiterWert !== 0 ? ersterWert / zweiterWert : 'Fehler';
      default: return zweiterWert;
    }
  };

  const operatorTippen = (naechsterOp) => {
    const eingabeWert = parseFloat(anzeige);

    if (vorherigerWert === null) {
      setVorherigerWert(eingabeWert);
    } else if (operator && !warteAufNeueZahl) {
      const ergebnis = berechne(vorherigerWert, eingabeWert, operator);
      setAnzeige(String(ergebnis));
      setVorherigerWert(ergebnis === 'Fehler' ? null : ergebnis);
    }

    setWarteAufNeueZahl(true);
    setOperator(naechsterOp === '=' ? null : naechsterOp);
  };

  const Taste = ({ text, farbe = '#333333', textFarbe = '#ffffff', breit = false, onPress }) => (
    <TouchableOpacity
      style={[
        styles.taste,
        { backgroundColor: farbe },
        breit && styles.tasteBreit
      ]}
      onPress={onPress}
    >
      <Text style={[styles.tastenText, { color: textFarbe }]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.displayBereich}>
        <Text style={styles.rechenwegText}>
          {vorherigerWert !== null && operator ? `${vorherigerWert} ${operator}` : ''}
        </Text>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {anzeige}
        </Text>
      </View>

      <View style={styles.tastenFeld}>
        <View style={styles.reihe}>
          <Taste text="AC" farbe="#a5a5a5" textFarbe="#000" onPress={allesLoeschen} />
          <Taste text="+/-" farbe="#a5a5a5" textFarbe="#000" onPress={vorzeichenWechseln} />
          <Taste text="%" farbe="#a5a5a5" textFarbe="#000" onPress={prozentRechnen} />
          <Taste text="÷" farbe="#ff9f0a" onPress={() => operatorTippen('÷')} />
        </View>
        <View style={styles.reihe}>
          <Taste text="7" onPress={() => zahlTippen(7)} />
          <Taste text="8" onPress={() => zahlTippen(8)} />
          <Taste text="9" onPress={() => zahlTippen(9)} />
          <Taste text="×" farbe="#ff9f0a" onPress={() => operatorTippen('×')} />
        </View>
        <View style={styles.reihe}>
          <Taste text="4" onPress={() => zahlTippen(4)} />
          <Taste text="5" onPress={() => zahlTippen(5)} />
          <Taste text="6" onPress={() => zahlTippen(6)} />
          <Taste text="-" farbe="#ff9f0a" onPress={() => operatorTippen('-')} />
        </View>
        <View style={styles.reihe}>
          <Taste text="1" onPress={() => zahlTippen(1)} />
          <Taste text="2" onPress={() => zahlTippen(2)} />
          <Taste text="3" onPress={() => zahlTippen(3)} />
          <Taste text="+" farbe="#ff9f0a" onPress={() => operatorTippen('+')} />
        </View>
        <View style={styles.reihe}>
          <Taste text="0" breit onPress={() => zahlTippen(0)} />
          <Taste text="." onPress={kommaTippen} />
          <Taste text="=" farbe="#ff9f0a" onPress={() => operatorTippen('=')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', justifyContent: 'flex-end' },
  displayBereich: { paddingHorizontal: 24, paddingBottom: 20, alignItems: 'flex-end' },
  rechenwegText: { color: '#888888', fontSize: 24, minHeight: 30 },
  displayText: { color: '#ffffff', fontSize: 72, fontWeight: '300' },
  tastenFeld: { paddingHorizontal: 12, paddingBottom: 20 },
  reihe: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  taste: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tasteBreit: {
    width: 168,
    alignItems: 'flex-start',
    paddingLeft: 30
  },
  tastenText: { fontSize: 32, fontWeight: '500' }
});