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
import HomeScreen from './src/screens/HomeScreen';

/**
 * Componente Principal do Aplicativo Busca Bico Camaquã.
 * Este arquivo controla qual tela o usuário deve ver dependendo do seu estado.
 */
export default function App() {
  // Armazena a sessão de login do usuário
  const [sessao, setSessao] = useState(null);
  
  // Controla se o aplicativo ainda está buscando informações iniciais
  const [estaCarregando, setEstaCarregando] = useState(true);
  
  // Armazena os dados do perfil (tipo de conta, nome, profissão, etc.)
  const [perfilUsuario, setPerfilUsuario] = useState(null);

  /**
   * Função para buscar os dados do perfil do usuário no banco de dados Supabase.
   * @param {string} idDoUsuario - O identificador único do usuário logado.
   */
  async function buscarDadosDoPerfil(idDoUsuario) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, full_name, occupation')
        .eq('id', idDoUsuario)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error.message);
      } else {
        setPerfilUsuario(data);
      }
    } catch (erroInesperado) {
      console.error('Erro inesperado:', erroInesperado);
    } finally {
      setEstaCarregando(false);
    }
  }

  /**
   * Função para atualizar o estado do aplicativo quando uma etapa é concluída.
   * Chamada após o login, após escolher o perfil ou após preencher o cadastro.
   */
  function atualizarFluxoDoAplicativo() {
    if (sessao?.user?.id) {
      buscarDadosDoPerfil(sessao.user.id);
    }
  }

  useEffect(() => {
    // 1. Verifica se já existe uma sessão ativa ao abrir o aplicativo
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      if (session) {
        buscarDadosDoPerfil(session.user.id);
      } else {
        setEstaCarregando(false);
      }
    });

    // 2. Monitora mudanças no estado de autenticação (Login ou Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSessao(session);
      if (session) {
        buscarDadosDoPerfil(session.user.id);
      } else {
        setPerfilUsuario(null);
        setEstaCarregando(false);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Exibe um indicador de carregamento enquanto o aplicativo decide qual tela mostrar
  if (estaCarregando) {
    return (
      <View style={styles.containerCarregamento}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.containerPrincipal}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* LÓGICA DE NAVEGAÇÃO: */}
      
      {/* Se não estiver logado, mostra a tela de Login */}
      {!sessao ? (
        <LoginScreen />
      ) : (
        /* Se logado, mas não escolheu entre Profissional ou Cliente */
        !perfilUsuario?.user_type ? (
          <ProfileSelectionScreen 
            session={sessao} 
            aoConcluir={atualizarFluxoDoAplicativo} 
          />
        ) : (
          /* Se escolheu ser Profissional, mas ainda não preencheu o formulário de cadastro */
          perfilUsuario.user_type === 'profissional' && !perfilUsuario.full_name ? (
            <ProfessionalFormScreen 
              session={sessao} 
              aoSalvar={atualizarFluxoDoAplicativo} 
            />
          ) : (
            /* Se for Cliente ou Profissional já cadastrado, mostra a Home (Lista) */
            <HomeScreen />
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
  }
});