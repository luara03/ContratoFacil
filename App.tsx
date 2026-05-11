import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Area = 'Pessoal' | 'Profissional';
type Tipo = 'Receita' | 'Despesa';

type Lancamento = {
  id: string;
  descricao: string;
  valor: number;
  area: Area;
  tipo: Tipo;
  data: string;
};

const lancamentosIniciais: Lancamento[] = [
  { id: '1', descricao: 'Salário', valor: 4500, area: 'Pessoal', tipo: 'Receita', data: '2026-05-01' },
  { id: '2', descricao: 'Aluguel escritório', valor: 1200, area: 'Profissional', tipo: 'Despesa', data: '2026-05-03' },
  { id: '3', descricao: 'Freelance', valor: 2200, area: 'Profissional', tipo: 'Receita', data: '2026-05-05' },
  { id: '4', descricao: 'Supermercado', valor: 650, area: 'Pessoal', tipo: 'Despesa', data: '2026-05-08' },
];

const moeda = (n: number) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function App() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(lancamentosIniciais);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [area, setArea] = useState<Area>('Pessoal');
  const [tipo, setTipo] = useState<Tipo>('Despesa');

  const resumo = useMemo(() => {
    const totalReceita = lancamentos.filter((l) => l.tipo === 'Receita').reduce((acc, l) => acc + l.valor, 0);
    const totalDespesa = lancamentos.filter((l) => l.tipo === 'Despesa').reduce((acc, l) => acc + l.valor, 0);

    const pessoal = lancamentos
      .filter((l) => l.area === 'Pessoal')
      .reduce((acc, l) => acc + (l.tipo === 'Receita' ? l.valor : -l.valor), 0);

    const profissional = lancamentos
      .filter((l) => l.area === 'Profissional')
      .reduce((acc, l) => acc + (l.tipo === 'Receita' ? l.valor : -l.valor), 0);

    return {
      totalReceita,
      totalDespesa,
      saldo: totalReceita - totalDespesa,
      pessoal,
      profissional,
    };
  }, [lancamentos]);

  const adicionarLancamento = () => {
    const numero = Number(valor.replace(',', '.'));
    if (!descricao.trim() || Number.isNaN(numero) || numero <= 0) return;

    const novo: Lancamento = {
      id: Date.now().toString(),
      descricao: descricao.trim(),
      valor: numero,
      area,
      tipo,
      data: new Date().toISOString().slice(0, 10),
    };

    setLancamentos((prev) => [novo, ...prev]);
    setDescricao('');
    setValor('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Gestor Financeiro Pessoal + Profissional</Text>

        <View style={styles.grid}>
          <Card label="Saldo Total" value={moeda(resumo.saldo)} highlight={resumo.saldo >= 0} />
          <Card label="Receitas" value={moeda(resumo.totalReceita)} highlight />
          <Card label="Despesas" value={moeda(resumo.totalDespesa)} highlight={false} />
          <Card label="Saldo Pessoal" value={moeda(resumo.pessoal)} highlight={resumo.pessoal >= 0} />
          <Card label="Saldo Profissional" value={moeda(resumo.profissional)} highlight={resumo.profissional >= 0} />
        </View>

        <View style={styles.form}>
          <Text style={styles.subtitle}>Novo lançamento</Text>
          <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Descrição" />
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="Valor (ex: 250.00)"
            keyboardType="decimal-pad"
          />

          <View style={styles.row}>
            {(['Pessoal', 'Profissional'] as Area[]).map((opcao) => (
              <Chip key={opcao} text={opcao} active={area === opcao} onPress={() => setArea(opcao)} />
            ))}
          </View>

          <View style={styles.row}>
            {(['Receita', 'Despesa'] as Tipo[]).map((opcao) => (
              <Chip key={opcao} text={opcao} active={tipo === opcao} onPress={() => setTipo(opcao)} />
            ))}
          </View>

          <Pressable style={styles.button} onPress={adicionarLancamento}>
            <Text style={styles.buttonText}>Adicionar</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          <Text style={styles.subtitle}>Últimos lançamentos</Text>
          {lancamentos.map((item) => (
            <View key={item.id} style={styles.item}>
              <View>
                <Text style={styles.itemTitle}>{item.descricao}</Text>
                <Text style={styles.itemMeta}>{item.area} • {item.tipo} • {item.data}</Text>
              </View>
              <Text style={[styles.itemValue, item.tipo === 'Receita' ? styles.positive : styles.negative]}>
                {item.tipo === 'Receita' ? '+' : '-'} {moeda(item.valor)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function Card({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <View style={[styles.card, highlight ? styles.cardPositive : styles.cardNegative]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function Chip({ text, active, onPress }: { text: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  grid: { gap: 10 },
  card: { borderRadius: 14, padding: 14 },
  cardPositive: { backgroundColor: '#dcfce7' },
  cardNegative: { backgroundColor: '#fee2e2' },
  cardLabel: { fontSize: 12, color: '#374151' },
  cardValue: { marginTop: 4, fontSize: 20, fontWeight: '700', color: '#111827' },
  form: { backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  button: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  list: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6b7280', fontSize: 12 },
  itemValue: { fontWeight: '700' },
  positive: { color: '#15803d' },
  negative: { color: '#b91c1c' },
});
