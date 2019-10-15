import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, TouchableNativeFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'


export default class Cliente extends Component<Props> {
  constructor(props){
    super(props);
    this.state = {loading: false, clientes: [], pesquisado: false};
  }

  static navigationOptions = ({navigation}) => ({
    title: 'Cliente',
    headerTintColor: '#ffffff',
    headerStyle: {
      backgroundColor: '#247869',
    },
    headerTitleStyle: {
      fontWeight: 'bold',
      alignSelf: 'center'
      },
      tabBarVisible: true,


  });

  componentDidMount(){
    
  }


  getCliente(client){
    //this.setState({loading: true});
    fetch('http://192.168.0.4:3000/clientes/'+client, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      /*body: JSON.stringify({
        firstParam: 'yourValue',
        secondParam: 'yourOtherValue',
      }),*/
    }).then((response)=> response.json()).then((resp) => {
      let aux = [];
      for(e in resp){
        aux.push(resp[e]);
      }
      this.setState({clientes: aux});
      this.setState({loading: false});
      
    }).catch((err)=>{
      Alert.alert('Atenção', 'erro ao conectar-se com o servidor!');
    });
  }

  render() {
    
    return (

      <View style={styles.container}>
        <View style={styles.input}>
          <TextInput placeholder="Digite o nome do cliente" style={{flex: 4}} onChangeText={(value)=>{
            this.setState({loading: true});
            this.setState({pesquisado: true});
            this.getCliente(value.toUpperCase());
            
          }}/>
          <Icon name='search' size={30} color="black"  style={{flex: 1, alignSelf: 'center', textAlign: 'center'}}
            onPress={()=> {
              //this.setState({loading: true});
              //this.getCliente(value);
            }}
          />
        </View>
        {this.state.loading? <ActivityIndicator size="large"/>:null}
        {
          this.state.clientes.length>0 && this.state.loading==false?
            <FlatList
              style={styles.list}
              data={this.state.clientes}
              numColumns={1}
              renderItem={({item}) => 
                <View style={styles.card} >
                    <TouchableNativeFeedback  onPress={(item)=>{console.log('touch!');}}>
                      <View style={styles.cardContent}>
                        <View style={{flex: 0, flexDirection: 'row'}}>
                          <Text style={styles.title}>{item.cod_cliente}</Text>
                          <Text style={styles.title}>-</Text>
                          <Text style={styles.title}>{item.nome}</Text>
                          
                        </View>
                        <View style={{flex: 0, flexDirection: 'row'}}>
                          <Text style={{fontWeight: '600'}}>Nome: </Text>
                          <Text>{item.nome}</Text>
                        </View>
                        
                        <View style={{flex: 0, flexDirection: 'row'}}>
                          <Text style={{fontWeight: '600'}}>Cidade: </Text>
                          <Text>{item.cidade}</Text>
                        </View>

                        <View style={{flex: 0, flexDirection: 'row'}}>
                          <Text style={{fontWeight: '600'}}>Endereço: </Text>
                          <Text style={styles.endereco}>{item.nome}</Text>
                        </View>
                        
                      </View>

                    </TouchableNativeFeedback>
                </View>
            }
              keyExtractor={({id},index)=>id}
        />:null
          
        }
        {(this.state.clientes.length==0 && this.state.loading==false) && this.state.pesquisado?
          <View style={{textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>
            <Text>Cliente não encontrado!</Text>
          </View>
          : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#ffffff',
  },
  input: {
    height: 50,
    elevation: 2,
    margin: 10,
    borderWidth: 0.2,
    flex: 0,
    flexDirection: 'row',
  },
  list:{

    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,

},
  card: {
    //paddingLeft: 10,
    marginRight: 2,
    marginLeft: 2,
    height: 150,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    elevation: 5,
    marginBottom: 10,
    alignContent: 'center',
    justifyContent: 'center',
},
cardContent: {
  padding: 10,
  flex: 1,
  //flexDirection: 'row'  
},

title: {fontWeight: '600', fontSize: 15, color: 'black'},
  
});