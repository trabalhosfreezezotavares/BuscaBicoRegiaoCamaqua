import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { supabase } from '../../supabase';

/**
 * Tela de Cadastro de Profissional
 * Onde o trabalhador de Camaquã preenche seus dados de serviço.
 */
export default function ProfessionalFormScreen({ session, aoSalvar }) {
  const [nome, setNome] = useState('');
  const [profissao, setProfissao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estaSalvando, setEstaSalvando] = useState(false);

  /**
   * Salva os dados do profissional na tabela 'profiles' do Supabase
   */
  async function salvarPerfilProfissional() {
    if (!nome || !profissao || !whatsapp) {
      Alert.alert('Atenção', 'Por favor, preencha o nome, profissão e WhatsApp.');
      return;
    }

    setEstaSalvando(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: nome,
          occupation: profissao,
          phone: whatsapp,
          bio: descricao,
          updated_at: new Date(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Sucesso!', 'Seu perfil profissional foi cadastrado em Camaquã!');
      
      // Notifica o componente pai que o cadastro terminou
      if (aoSalvar) aoSalvar();

    } catch (erro) {
      console.error('Erro ao salvar profissional:', erro.message);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    } finally {
      setEstaSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.containerPrincipal}>
      <ScrollView contentContainerStyle={styles.scrollConteudo}>
        <Text style={styles.titulo}>Seu Cartão de Visitas</Text>
        <Text style={styles.subtitulo}>Preencha como os clientes de Camaquã vão te encontrar.</Text>

        <View style={styles.formulario}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: João da Silva"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Sua Profissão / Serviço</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: Eletricista, Pedreiro, Diarista..."
            value={profissao}
            onChangeText={setProfissao}
          />

          <Text style={styles.label}>WhatsApp de Contato</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: 51999887766"
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Resumo do que você faz (Opcional)</Text>
          <TextInput 
            style={[styles.input, styles.inputMultilinha]}
            placeholder="Conte um pouco sobre sua experiência..."
            value={descricao}
            onChangeText={setDescricao}
            multiline={true}
            numberOfLines={4}
          />

          <TouchableOpacity 
            style={styles.botaoSalvar} 
            onPress={salvarPerfilProfissional}
            disabled={estaSalvando}
          >
            {estaSalvando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.textoBotaoSalvar}>Publicar Meu Perfil</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: { flex: 1, backgroundColor: '#ffffff' },
  scrollConteudo: { padding: 25 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10, textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
  formulario: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  inputMultilinha: { height: 100, textAlignVertical: 'top' },
  botaoSalvar: { backgroundColor: '#10b981', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  textoBotaoSalvar: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});