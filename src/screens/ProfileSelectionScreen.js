import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { supabase } from '../../supabase';

/**
 * Tela de Seleção de Perfil - Busca Bico Camaquã
 * Permite que o usuário escolha entre ser um Profissional ou um Cliente.
 * * @param {Object} props.session - Sessão ativa do usuário vinda do Supabase
 * @param {Function} props.aoConcluir - Função do App.js para atualizar o fluxo do aplicativo
 */
export default function ProfileSelectionScreen({ session, aoConcluir }) {
  // Estado para mostrar o carregamento enquanto o banco de dados processa a escolha
  const [estaCarregando, setEstaCarregando] = useState(false);

  /**
   * Salva o tipo de usuário (profissional ou cliente) no banco de dados
   * @param {string} tipoEscolhido - O valor que será salvo na coluna 'user_type'
   */
  async function definirTipoDeUsuario(tipoEscolhido) {
    setEstaCarregando(true);

    try {
      // Atualiza a tabela 'profiles' no Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: tipoEscolhido })
        .eq('id', session.user.id);

      if (error) {
        throw error;
      }

      // Se salvou no banco, agora avisamos ao App.js para mudar a tela automaticamente
      if (aoConcluir) {
        aoConcluir();
      }

    } catch (erro) {
      console.error('Erro ao definir perfil:', erro.message);
      Alert.alert(
        'Erro de Conexão', 
        'Não conseguimos salvar sua escolha em Camaquã. Verifique sua internet e tente novamente.'
      );
    } finally {
      setEstaCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.containerPrincipal}>
      <View style={styles.conteudo}>
        
        <View style={styles.areaCabecalho}>
          <Text style={styles.tituloBoasVindas}>Quase lá!</Text>
          <Text style={styles.textoInformativo}>
            Para personalizar sua experiência em Camaquã, escolha como deseja usar o Busca Bico hoje:
          </Text>
        </View>

        {/* Opção: Profissional (Azul) */}
        <TouchableOpacity 
          style={[styles.botaoOpcao, styles.botaoProfissional]} 
          onPress={() => definirTipoDeUsuario('profissional')}
          disabled={estaCarregando}
        >
          {estaCarregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View>
              <Text style={styles.textoBotaoTitulo}>Sou Profissional</Text>
              <Text style={styles.textoBotaoDescricao}>Quero oferecer meus serviços</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Opção: Cliente (Verde) */}
        <TouchableOpacity 
          style={[styles.botaoOpcao, styles.botaoCliente]} 
          onPress={() => definirTipoDeUsuario('cliente')}
          disabled={estaCarregando}
        >
          {estaCarregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View>
              <Text style={styles.textoBotaoTitulo}>Sou Cliente</Text>
              <Text style={styles.textoBotaoDescricao}>Estou procurando um profissional</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.textoRodape}>
          Você é livre para mudar seu tipo de perfil nas configurações a qualquer momento.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  conteudo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  areaCabecalho: {
    marginBottom: 40,
  },
  tituloBoasVindas: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a', // Azul Marinho
    marginBottom: 10,
  },
  textoInformativo: {
    fontSize: 16,
    color: '#4b5563', // Cinza escuro
    lineHeight: 24,
  },
  botaoOpcao: {
    height: 90,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  botaoProfissional: {
    backgroundColor: '#1e3a8a',
  },
  botaoCliente: {
    backgroundColor: '#10b981', // Verde
  },
  textoBotaoTitulo: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textoBotaoDescricao: {
    color: '#e0e7ff',
    fontSize: 14,
    marginTop: 2,
  },
  textoRodape: {
    marginTop: 30,
    fontSize: 12,
    textAlign: 'center',
    color: '#9ca3af',
    lineHeight: 18,
  },
});