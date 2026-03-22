import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../../supabase';

// Necessário para o retorno do Google Auth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  // Estados para o Login com E-mail (Principal)
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(false);

  // Configuração para o Login com Google (Opcional)
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '453306000326-tksqttfb1h1487om5u6inb00coneggsu.apps.googleusercontent.com',
    webClientId: '453306000326-vc4largfvshpa1queepgaco26nbcms70.apps.googleusercontent.com',
    clientId: '453306000326-vc4largfvshpa1queepgaco26nbcms70.apps.googleusercontent.com',
  });

  // Monitora o sucesso do Google
  useEffect(() => {
    async function validarGoogle() {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: id_token,
        });
        if (error) Alert.alert('Erro', 'Falha ao entrar com Google.');
      }
    }
    validarGoogle();
  }, [response]);

  /**
   * FUNÇÃO PRINCIPAL: Login com E-mail e Senha
   */
  async function fazerLoginComEmail() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }
    setEstaCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });
    if (error) {
      Alert.alert('Erro', 'Usuário ou senha incorretos.');
    }
    setEstaCarregando(false);
  }

  /**
   * FUNÇÃO: Criar Nova Conta com E-mail
   */
  async function criarNovaConta() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha os campos para criar sua conta.');
      return;
    }
    setEstaCarregando(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: senha,
    });
    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso!', 'Verifique seu e-mail para confirmar o cadastro.');
    }
    setEstaCarregando(false);
  }

  return (
    <SafeAreaView style={styles.containerPrincipal}>
      <ScrollView contentContainerStyle={styles.scrollConteudo}>
        
        <View style={styles.areaLogo}>
          <Text style={styles.tituloApp}>Busca Bico</Text>
          <Text style={styles.subtituloApp}>Camaquã e Região</Text>
        </View>

        <View style={styles.areaFormulario}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: joseluis@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input}
            placeholder="Sua senha secreta"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={true}
          />

          <TouchableOpacity 
            style={styles.botaoPrincipal} 
            onPress={fazerLoginComEmail}
            disabled={estaCarregando}
          >
            {estaCarregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotaoPrincipal}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={criarNovaConta} style={styles.botaoSecundario}>
            <Text style={styles.textoBotaoSecundario}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>

        {/* OPÇÃO SECUNDÁRIA: GOOGLE */}
        <View style={styles.areaGoogle}>
          <View style={styles.divisor}>
            <View style={styles.linha} />
            <Text style={styles.textoDivisor}>ou</Text>
            <View style={styles.linha} />
          </View>

          <TouchableOpacity 
            style={styles.botaoGoogle} 
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Text style={styles.textoBotaoGoogle}>Entrar com Google</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: { flex: 1, backgroundColor: '#ffffff' },
  scrollConteudo: { padding: 30, flexGrow: 1, justifyContent: 'center' },
  areaLogo: { alignItems: 'center', marginBottom: 40 },
  tituloApp: { fontSize: 40, fontWeight: 'bold', color: '#1e3a8a' },
  subtituloApp: { fontSize: 16, color: '#10b981', fontWeight: 'bold' },
  areaFormulario: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 5 },
  input: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  botaoPrincipal: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  textoBotaoPrincipal: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  botaoSecundario: { marginTop: 20, alignItems: 'center' },
  textoBotaoSecundario: { color: '#1e3a8a', fontWeight: '600' },
  areaGoogle: { marginTop: 40 },
  divisor: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  linha: { flex: 1, height: 1, backgroundColor: '#d1d5db' },
  textoDivisor: { marginHorizontal: 10, color: '#9ca3af' },
  botaoGoogle: { backgroundColor: '#ffffff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db' },
  textoBotaoGoogle: { color: '#374151', fontWeight: 'bold' },
});