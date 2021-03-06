import React, {Component} from 'react';
import {Alert,StyleSheet, Text ,View,Button, Linking,
  TouchableNativeFeedback, ScrollView, NativeModules} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SwipeListView} from 'react-native-swipe-list-view';
import { StackActions, NavigationActions } from 'react-navigation';
import * as config from '../../config';
import MapView,{PROVIDER_GOOGLE} from 'react-native-maps';

const OpenMapModule = NativeModules.OpenMapModule;

const _request ="PEDIDO";
const opencagedataApi_key = "27699a4b223f4c028bca825642181b0f";

export default class Request extends Component<Props> {
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      pedido: [],
      totalPedido: '',
      cod_vendedor: '',
      nome_vendedor: '',
      moeda: ''
    };
    const { navigation } = this.props;
    //this.aysncData();
    //this.teste();
    this.willFocuSub={};
    this.willFocuSub = this.props.navigation.addListener(
      'willFocus',
      ()=>{
        console.log('voltando');
        this.contabilizaProdutos();
      }
    );
  }

  async contabilizaProdutos(){
    
    await AsyncStorage.getItem(_request,(error,result) => {
      if(result){
        //console.log(result);
        //console.log(JSON.parse(result));
        this.setState({pedido: JSON.parse(result)});
        this.contabilizaTotal();
      }else{
       //alert('não tem nada');
      }
    });
    
  }
  

  componentDidMount(){
    this.getIp();
    this.getUser();
    this.getUserCod();
    //AsyncStorage.removeItem(_request)
    this.getTipoMoeda();
    
  }

  

  getIp(){
    AsyncStorage.getItem('_ip',(error,result)=> {
        if(error){
            //AsyncStorage.setItem('_ip',config.url);
            //API = config.url;
        }
        if(result){
          //API = result;
          config.url = result;
        }
    });
  }

  getUser(){
    AsyncStorage.getItem('user',(error,result) => {
      if(result){
        this.setState({nome_vendedor: result});

      }else{
       //alert('não tem nada');
      }
    });
  }

  getUserCod(){
    AsyncStorage.getItem('user_cod',(error,result) => {
      if(result){
        this.setState({cod_vendedor: result});

      }else{
       //alert('não tem nada');
      }
    });
  }
  

  static navigationOptions = ({navigation}) => ({
      title: 'Novo Pedido',
      headerTintColor: '#ffffff',
      headerStyle: {
        backgroundColor: '#247869',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        alignSelf: 'center'
        },
        tabBarVisible: true,
        headerRight: null
  });

  
  numberToReal(numero) {
    var numero = Number(numero).toFixed(2).split('.');
    numero[0] = "" + numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');
  }

  getTipoMoeda(){
    AsyncStorage.getItem('moeda',(error,result)=> {
      if(result){
        //API = result;
        this.setState({moeda: result});
      }
    });
  }

  contabilizaTotal(){
    /*const total = (this.state.pedido)
    .map(p => p.preco_venda).reduce(
      (total, preco)=>total+Number(preco),0);
      //alert(total);
    this.setState({totalPedido: total});*/
    const total = (this.state.pedido)
    .map(p=> p.preco_venda).reduce(
      (total, preco)=>total+Number(preco),0);
    this.setState({totalPedido: total});  
  }

  sendItens(numero_pedido){
    let aux = this.state.pedido;
    for(let e in aux){
      this.sendItensData(aux[e],numero_pedido);
    }
    
  }

  sendItensData(data, _numero_pedido){
    let _data = {
      numero_pedido: _numero_pedido,
      id_produto: data.cod_produto,
      cod_produto: data.cod_produto,
      descricao: data.descricao,
      marca: data.marca,
      qtd_pedida: data.qtd,
      preco_unitario: data.preco_uni,
      preco_total: data.preco_venda,
      tipo: data.tipo_unid,
      obs_produto: data.obs_produto
    };

    fetch(config.url+'pedidoitens', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_data),
      
    }).then((response) => response.json()).then((resp) => {
      //this.sendItens();
      AsyncStorage.removeItem(_request);
      const {dispatch} = this.props.navigation;
      const resetActionHome = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: 'Cliente', 
          params: {message: 'contas enviado com sucesso!'} }),
        ],
      });
      this.setState({loading: false});
      dispatch(resetActionHome);
      
      console.log(resp);
    }).catch((err)=>{
      Alert.alert('Atenção', 'erro');
      this.setState({loading: false});
      console.log(err);
    });
  }

  fecharPedido(){
    let data = {
      cod_cliente: this.props.navigation.getParam('cod_cliente'),
      nome_cliente: this.props.navigation.getParam('nome'),
      cod_vendedor: Number(this.state.cod_vendedor),
      nome_vendedor: this.state.nome_vendedor,
      subtotal: Number(this.state.totalPedido),
      total: Number(this.state.totalPedido),
      nome_entrega:	this.props.navigation.getParam('nome'),
      cep_entrega: this.props.navigation.getParam('cep'),
      endereco_entrega:	this.props.navigation.getParam('endereco'),
      numero_entrega:	this.props.navigation.getParam('numero'),
      bairro_entrega:	this.props.navigation.getParam('bairro'),
      cidade_entrega:	this.props.navigation.getParam('cidade'),
      estado_entrega:	this.props.navigation.getParam('uf'),
      telefone_entrega:	this.props.navigation.getParam('telefone'),
      celular_entrega: this.props.navigation.getParam('celular'),
    };
    fetch(config.url+'pedidoexterno', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      
    }).then((response) => response.json()).then((resp) => {
      this.sendItens(resp.numero_pedido);
      
      console.log(resp);
    }).catch((err)=>{
      Alert.alert('Atenção', 'erro');
      this.setState({loading: false});
      console.log(err);
    });
  }

  numberToQTd(numero) {
    var numero = numero.toFixed(3).split('.');
    numero[0] = "" + numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');
  }

  //requisição para buscar Lat, Lng apartir de dados do endereço
  getLatLng(endereco, numero, bairro, cidade, uf){
      Linking.openURL('https://www.google.com/maps/dir/?api=1&destination='+endereco+', '+numero+' - '+bairro+', '+cidade+' - '+uf+'&travelmode=driving');
  }

  render(){
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
          <View style={styles.cardContentOneRow}>
                <View style={{flex: 0, flexDirection: 'row', paddingTop: 15}}>
                    <Text style={styles.title}>{this.props.navigation.getParam('cod_cliente')}</Text>
                    <Text style={{  fontWeight: '600', fontSize: 15, color: 'black'}}>-</Text>
                    <Text style={{  fontWeight: '600', fontSize: 15, color: 'black', flex: 1}}>{this.props.navigation.getParam('nome')}</Text>    
                </View>
                <View style={{flex: 0, flexDirection: 'row'}}>
                  <Text style={{fontWeight: '600'}}>Telefone: </Text>
                  <Text>{this.props.navigation.getParam('telefone')} / {this.props.navigation.getParam('celular')}</Text>
                </View>
                <View style={{flex: 0, flexDirection: 'row'}}>
                  <View style={{flex: 5, flexDirection: 'row'}}>
                    <Text style={{fontWeight: '600'}}>Endereço: </Text>
                    <Text style={{flex: 1}}>{this.props.navigation.getParam('endereco')}</Text>
                  </View>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    
                      <Text style={{fontWeight: '600'}}>Nº: </Text>
                      <Text style={{flex: 1}}>{this.props.navigation.getParam('numero')}</Text>
                    
                  </View>
                </View>

                <View style={{flex: 0, flexDirection: 'row'}}>
                  <View style={{flex: 1,marginRight: 1}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{fontWeight: '600'}}>CEP: </Text>
                      <Text>{this.props.navigation.getParam('cep')}</Text>
                    </View>
                  </View>
                  <View style={{flex: 2}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{fontWeight: '600'}}>Bairro: </Text>
                      <Text>{this.props.navigation.getParam('bairro')}</Text>
                    </View>
                  </View>  
                </View>
                        
                <View style={{flex: 0, flexDirection: 'row'}}>
                  <View style={{flex: 0, marginRight: 2}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{fontWeight: '600', }}>Cidade: </Text>
                      <Text>{this.props.navigation.getParam('cidade')}</Text>
                    </View>
                  </View>
                  <View style={{flex: 1, flexDirection: 'row' ,}}>
                    <View style={{flex: 1, alignContent: 'flex-end', alignItems: 'flex-end'}}>
                      <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}}>
                        <Text style={{fontWeight: '600'}}>UF: </Text>
                        <Text>{this.props.navigation.getParam('uf')}</Text>
                      </View>
                    </View>

                    <View style={{flex: 1, alignContent: 'flex-end', alignItems: 'flex-end'}}>
                      <View style={styles.floatMarker}>
                        <MaterialCommunityIcons name={'map-marker'} size={25} color="#ea4335" 
                        onPress={()=>{
                          /*this.props.navigation.navigate('Map',
                          {
                            cod_cliente: item.cod_cliente,
                            nome: item.nome,
                            telefone: item.telefone,
                            endereco: item.endereco,
                            cidade: item.cidade,
                            estado: item.estado,
                            numero: item.numero,
                            uf: item.uf,
                          });*/
                          this.getLatLng(this.props.navigation.getParam('endereco'), this.props.navigation.getParam('numero'), this.props.navigation.getParam('bairro'), this.props.navigation.getParam('cidade'), this.props.navigation.getParam('uf'));
                          
                        }}/>
                      </View>
                    </View>
                  </View>
                </View>
                
                  
                <View style={{flex: 0, flexDirection: 'row', borderBottomWidth: 0.5,
                borderBottomColor: '#000000'}}>
                  <Text style={{fontWeight: '600', color: 'red'}}>Observação: </Text>
                  <Text style={{color :'red', flex: 1}}>{this.props.navigation.getParam('observacao')}</Text>
                </View>
                <View style={{flex: 0, flexDirection: 'row'}}>
                  <View style={{flex: 2}}>
                    <Text style={{fontWeight: '600',fontSize: 13, color: 'black'}}>Limite de compra: </Text>
                    <Text style={{fontWeight: '600', fontSize: 13, color: 'black'}}>Saldo devedor: </Text>
                    <Text style={{fontWeight: '600', fontSize: 13, color: 'black'}}>Saldo de compra: </Text>
                  </View>
                  <View style={{flex: 1, alignContent: 'center', alignItems: 'flex-end'}}>
                    <Text style={{alignContent: "center", color: 'black', fontWeight: '600',fontSize: 13,}}>
                      {this.state.moeda == "G" ? 
                       this.numberToReal(Number(this.props.navigation.getParam('limite'))).split(',')[0]
                      :this.numberToReal(Number(this.props.navigation.getParam('limite')))}
                    </Text>
                    <Text style={{color: 'red'}}>{this.state.moeda == "G" ? 
                      this.numberToReal(Number(this.props.navigation.getParam('saldo_devedor'))).split(',')[0]
                      :this.numberToReal(Number(this.props.navigation.getParam('saldo_devedor')))}</Text>
                    <Text style={{color: this.props.navigation.getParam('saldo_compra')<0?'red':'green'}}>{
                    this.state.moeda == "G" ? 
                    (this.numberToReal(Number(this.props.navigation.getParam('saldo_compra'))).replace("-.","-")).split(',')[0]
                    :this.numberToReal(Number(this.props.navigation.getParam('saldo_compra'))).replace("-.","-")}</Text>
                  </View>

                </View>
          </View>
          <View style={styles.card} onPress={()=>{}}>
              <View style={styles.cardContentOneRow}>
                  <View style={{flex: 0, flexDirection: 'row', }}>
                    <View style={{flex: 2}}>
                      <View style={{ flex: 0, flexDirection: 'row', paddingTop: 15}}>
                        <Text style={{flex: 1,fontWeight: '600', color: 'black', fontSize: 15}}>Data: </Text>
                        <View style={{flex: 2, flexDirection: 'row'}}>
                          <Text style={{marginRight: 2}}>
                            {new Date().getDate()}/{new Date().getMonth()+1}/{new Date().getFullYear()}
                          </Text>
                          <Text>
                            {new Date().getHours()}:{new Date().getMinutes()<10?'0'+new Date().getMinutes(): new Date().getMinutes()}
                          </Text>
                        </View>
                      </View>
                      <View style={{flex: 0, flexDirection: 'row'}}>      
                        <View style={{flex: 1, flexDirection: 'row'}}>
                          <Text style={{fontWeight: '600', 
                          color: 'black', fontSize: 15}}>F. Pagamento: </Text>
                          <Text style={{flex: 3, justifyContent: 'flex-start'}}>DINHEIRO</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={{flex: 1, paddingTop: 15}}>
                      <Button title="Entrega" onPress={()=>this.props.navigation.navigate('DadosEntrega',
                        {
                          nome: this.props.navigation.getParam('nome'),
                          telefone: this.props.navigation.getParam('telefone'),
                          celular: this.props.navigation.getParam('celular'),
                          endereco: this.props.navigation.getParam('endereco'),
                          cep: this.props.navigation.getParam('cep'),
                          bairro: this.props.navigation.getParam('bairro'),
                          cidade: this.props.navigation.getParam('cidade'),
                          numero: this.props.navigation.getParam('numero'),
                          uf: this.props.navigation.getParam('uf'),
                        }
                        )
                      }/>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row',  justifyContent: 'flex-end', paddingTop: 2}}>
                      <View style={styles.float}>
                        <AntDesign name={'plus'} size={25} color="#ffffff" onPress={()=>{
                          this.props.navigation.navigate('Produto');
                        }}/>
                      </View>
                    </View>
                  </View>                
              </View>
          </View>      
 
        <View style={{backgroundColor: "#E0E0E0", padding: 10,flex: 1}}>
            <Text>Itens do pedido</Text>
            {this.state.pedido.length==0
            ?<View style={{backgroundColor: '#E0E0E0',
              borderWidth: 0.4, borderColor: 'gray',
              alignItems: 'center', paddingTop: 10,
              paddingBottom: 10
              }}>
              <Text>Nenhum item no pedido</Text>
            </View>
            :
        
            <SwipeListView
              data={this.state.pedido}
              renderItem={(data, rowMap) => (
                <View style={{
                  borderRadius: 5,
                  borderWidth: 0.6,
                  backgroundColor: '#ccc',
                  borderColor: '#EEEEEE',
                  elevation: 2,
                }}>
                      <View style={{flex: 0, padding: 10}}>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{fontWeight: '800', color: 'black', flex: 1}}>
                            {data.item.cod_produto}
                          </Text>
                          <Text style={{flex: 5,fontWeight: '600', color: 'black',}}>
                            {data.item.descricao}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <View style={{flex: 1}}>
                           <Text>Quantidade:</Text> 
                          </View>
                          <View style={{flex: 1, alignItems: 'center'}}>
                            <Text >Preço: </Text>
                          </View>
                          <View style={{flex: 1, alignItems: 'center'}}>
                            <Text >Total: </Text>
                          </View>
                        </View>
                        <View style={{flexDirection: 'row'}}>

                          <View style={{flex: 1, alignItems: 'stretch', }}>
                            <Text style={{fontWeight: '600', color: 'black',}}>{(data.item.tipo_unid == "UND" 
                    || data.item.tipo_unid == "UN")? data.item.qtd :this.numberToQTd(Number(data.item.qtd))} </Text>
                          </View>
                          <View style={{flex: 1, alignItems: 'flex-end',}}>
                            <Text style={{fontWeight: '600', color: 'black',}}>
                            {this.state.moeda == "G" ? this.numberToReal(data.item.preco_uni).split(',')[0]
                            :this.numberToReal(data.item.preco_uni)} </Text> 
                          </View>
                          <View style={{flex: 1, alignItems: 'flex-end',}}>
                            <Text style={{fontWeight: '600', color: 'black',}}>
                              {this.state.moeda == "G" ? this.numberToReal(data.item.preco_venda).split(',')[0]
                              :this.numberToReal(data.item.preco_venda)}
                            </Text>
                          </View>
 
                        </View>
                      </View>
                      
                                      
                </View>
              )}
              renderHiddenItem={({data, index}, rowMap) => (
                <View style={styles.rowBack}>
                  <Text style={{flex: 1}}></Text>
                  <TouchableNativeFeedback style={{paddingTop: 5, paddingBottom:5, 
                  backgroundColor: 'red'}} 
                  onPress={()=> {
                    
                    let aux = this.state.pedido;
                    let newAux = [];
                    let total = 0;
                    for(let e in aux){
                      if(e!=index){
                        console.log(e);
                        newAux.push(aux[e]);
                        
                      }
                    }

                    for(let e in newAux){
                      total+=Number(newAux[e].preco_venda);
                    }
                    console.log(newAux);
                    AsyncStorage.setItem(_request,JSON.stringify(newAux));
                    this.setState({pedido: newAux, totalPedido: total});
                    //this.contabilizaTotal();

                  }}
                  >
                    
                    <Text style={{color: 'white'}}>Remover</Text>
                   
                  </TouchableNativeFeedback>
                </View>
              )}
              leftOpenValue={75}
              rightOpenValue={-75}
            />
          }
          
          
        </View>
        <View style={{alignItems: 'flex-end',padding: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{  fontWeight: '600', fontSize: 13, color: 'black'}}>Total do pedido: </Text>
            <Text style={{color: Number(this.state.totalPedido)>0? 'green' : 'red'}}>
              {this.state.moeda == "G" ? this.numberToReal(Number(this.state.totalPedido)).split(',')[0]
              : this.numberToReal(Number(this.state.totalPedido))}</Text>
          </View>
        </View>

        <View >
           <Button title="confirmar pedido" onPress={
             ()=> {
               if(this.state.pedido.length>0){
              Alert.alert('Atenção', 'confirma o lançamento do pedido?',
              [
                {
                  text: 'Cancelar',
                  onPress: () => console.log('cancel'),
                  style: 'cancel',
                },
                {
                  text: 'Confimar',
                  onPress: () => {
                    
                    this.fecharPedido();
                },
                  
                }
              ]
              )}else{
                Alert.alert('Atenção', 'nenhum item no pedido!');
              }
             }
           }/> 
        </View>

      </View>
    );                                                                                                                                    
  }
}

const styles = StyleSheet.create({
  
  
  mapContainer: {
    
    height: 150,
    width: 400,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatMarker: {
    width: 25,  
    height: 25,   
    borderRadius: 12,            
    backgroundColor: 'white',                                    
    //position: 'absolute', 
    justifyContent: "center",
    alignItems: "center",                                     
    //bottom: 10,                                                    
    //right: 15,
    elevation: 3,
    
  },
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  card: {
    //textAlign: 'center',
    //borderBottomWidth: 2,
   // borderColor: 'black',
    //textDecorationStyle: "solid",
  },
  cardContent:{
    flex: 0, flexDirection: 'row', paddingTop: 15, 
    paddingBottom:15, borderBottomColor: 'gray', borderBottomWidth: 0.65,
    paddingLeft: 10,paddingRight: 10
  },
  cardContentOneRow: {
    paddingLeft: 10,paddingRight: 10,
    /*paddingTop: 15,*/ paddingBottom:15,borderBottomColor: 'gray', borderBottomWidth: 0.65,
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    justifyContent: 'center',
    //height: 50,
},
rowBack: {
  alignItems: 'center',
  backgroundColor: 'red',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 15,
  borderWidth: 0.6,
  borderColor: '#eeeeee'
},
  float: {
    width: 60,  
    height: 60,   
    borderRadius: 30,            
    backgroundColor: '#30dac5',
    marginTop: 2,                                   
   // position: 'absolute', 
    justifyContent: "center",
    alignItems: "center",                                     
    //bottom: 10,                                                    
    //right: 15,
    elevation: 3
  }
  
});
