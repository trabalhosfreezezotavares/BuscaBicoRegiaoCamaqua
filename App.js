import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { supabase } from './supabase';

// Importação das Telas do Aplicativo
import LoginScreen from './src/screens/LoginScreen';
import ProfileSelectionScreen from './src/screens/ProfileSelectionScreen';
import ProfessionalFormScreen from './src/screens/ProfessionalFormScreen';

/**
 * Componente Raiz do Aplicativo Busca Bico Camaquã.
 * Gerencia a navegação principal baseada no estado de autenticação e no perfil do banco de dados.
 */
export default function App() {
  // Estado para armazenar a sessão ativa do Supabase
  const [sessao, setSessao] = useState(null);
  
  // Estado para controlar se o aplicativo ainda está carregando dados iniciais
  const [estaCarregando, setEstaCarregando] = useState(true);
  
  // Estado para armazenar os dados do perfil do usuário logado (user_type, full_name, etc.)
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  /**
   * Busca as informações do perfil do usuário diretamente na tabela 'profiles' do Supabase.
   * @param {string} idDoUsuario - O UUID único do usuário autenticado.
   */
  async function buscarDadosDoPerfil(idDoUsuario) {
    try {
      // Fazemos a consulta para saber o tipo de usuário e se ele já completou o cadastro
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, full_name, occupation')
        .eq('id', idDoUsuario)
        .single();

      if (error && error.code !== 'PGRST116') {
        // O erro PGRST116 significa que a linha ainda não existe, o que é normal no primeiro login
        console.error('Erro ao buscar perfil no Supabase:', error.message);
      } else {
        // Armazenamos os dados encontrados (ou null se for novo usuário)
        setPerfilUsuario(data);
      }
    } catch (erroInesperado) {
      console.error('Erro inesperado na busca de perfil:', erroInesperado);
    } finally {
      // Após a tentativa de busca, paramos o indicador de carregamento
      setEstaCarregando(false);
    }
  }

  /**
   * Função chamada pelas telas filhas para atualizar o estado do aplicativo.
   * Isso faz com que a tela mude automaticamente após uma ação do usuário.
   */
  function atualizarFluxoDoAplicativo() {
    if (sessao?.user?.id) {
      buscarDadosDoPerfil(sessao.user.id);
    }
  }

  useEffect(() => {
    // 1. Verifica se já existe uma sessão salva no dispositivo ao abrir o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      if (session) {
        buscarDadosDoPerfil(session.user.id);
      } else {
        setEstaCarregando(false);
      }
    });

    // 2. Escuta em tempo real mudanças no estado da autenticação (Login ou Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSessao(session);
      if (session) {
        buscarDadosDoPerfil(session.user.id);
      } else {
        setPerfilUsuario(null);
        setEstaCarregando(false);
      }
    });

    // Limpa a escuta quando o componente é destruído
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Exibe uma tela de carregamento com o símbolo girando enquanto busca os dados
  if (estaCarregando) {
    return (
      <View style={styles.containerCarregamento}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.containerPrincipal}>
      {/* Configura a barra de status do celular (hora, bateria) para fundo branco e ícones escuros */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* LÓGICA DE NAVEGAÇÃO ENTRE TELAS: */}
      
      {/* CASO 1: Usuário não está logado */}
      {!sessao ? (
        <LoginScreen />
      ) : (
        /* CASO 2: Usuário logado, mas ainda não escolheu se é Profissional ou Cliente */
        !perfilUsuario?.user_type ? (
          <ProfileSelectionScreen 
            session={sessao} 
            aoConcluir={atualizarFluxoDoAplicativo} 
          />
        ) : (
          /* CASO 3: Usuário escolheu ser 'Profissional', mas ainda não preencheu o formulário de cadastro */
          perfilUsuario.user_type === 'profissional' && !perfilUsuario.full_name ? (
            <ProfessionalFormScreen 
              session={sessao} 
              aoSalvar={atualizarFluxoDoAplicativo} 
            />
          ) : (
            /* CASO 4: Usuário é Cliente ou Profissional já cadastrado. Aqui entra a Home do App. */
            <View style={styles.containerFinalizado}>
              <ActivityIndicator size="small" color="#10b981" />
              {/* Próximo passo: Desenvolver a Lista de Bicos para Camaquã aqui */}
            </View>
          )
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerCarregamento: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  containerFinalizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});