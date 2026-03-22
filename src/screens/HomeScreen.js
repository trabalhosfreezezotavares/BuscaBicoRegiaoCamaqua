import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { supabase } from '../../supabase';

/**
 * Tela Principal (Home) - Lista de Profissionais em Camaquã
 */
export default function HomeScreen() {
  const [profissionais, setProfissionais] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);

  // Busca a lista de profissionais no banco de dados assim que a tela abre
  useEffect(() => {
    buscarProfissionais();
  }, []);

  async function buscarProfissionais() {
    try {
      setEstaCarregando(true);
      // Busca apenas perfis que já preencheram o nome e são do tipo profissional
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'profissional')
        .not('full_name', 'is', null);

      if (error) throw error;
      setProfissionais(data || []);
    } catch (erro) {
      console.error('Erro ao buscar profissionais:', erro.message);
    } finally {
      setEstaCarregando(false);
    }
  }

  /**
   * Abre o WhatsApp diretamente no número do profissional
   * @param {string} telefone - O número salvo no cadastro
   */
  function abrirWhatsApp(telefone) {
    if (!telefone) return;
    // Limpa o número para garantir que funcione (remove espaços e traços)
    const numeroLimpo = telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${numeroLimpo}`;
    Linking.openURL(url).catch(() => {
      alert('Não foi possível abrir o WhatsApp');
    });
  }

  // Desenho de cada "Cartão" de profissional na lista
  const renderizarProfissional = ({ item }) => (
    <View style={styles.cartao}>
      <View style={styles.info}>
        <Text style={styles.nome}>{item.full_name}</Text>
        <Text style={styles.profissao}>{item.occupation || 'Profissional Liberal'}</Text>
        <Text style={styles.bio} numberOfLines={2}>{item.bio || 'Sem descrição disponível.'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.botaoContato}
        onPress={() => abrirWhatsApp(item.phone)}
      >
        <Text style={styles.textoBotao}>Chamar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Busca Bico</Text>
        <Text style={styles.subtitulo}>Profissionais em Camaquã</Text>
      </View>

      {estaCarregando ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id}
          renderItem={renderizarProfissional}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>Nenhum profissional cadastrado ainda.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  cabecalho: { padding: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  subtitulo: { fontSize: 14, color: '#6b7280' },
  lista: { padding: 15 },
  cartao: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  info: { flex: 1, marginRight: 10 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  profissao: { fontSize: 14, color: '#1e3a8a', fontWeight: '600', marginBottom: 5 },
  bio: { fontSize: 13, color: '#6b7280' },
  botaoContato: { 
    backgroundColor: '#10b981', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 8 
  },
  textoBotao: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  listaVazia: { textAlign: 'center', marginTop: 50, color: '#9ca3af' }
});