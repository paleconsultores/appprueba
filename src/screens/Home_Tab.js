/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    AsyncStorage,
    StatusBar,
    Dimensions,
    Platform, Text,
    FlatList,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFondation from 'react-native-vector-icons/Foundation'
import Producto from '../components/Producto'
import store from '../store'
import { URL_WS } from '../Constantes'
const { width, height } = Dimensions.get('window')
export default class Home extends Component<{}> {
    static navigationOptions = {
        title: 'Home',
        headerTintColor: 'purple',
        header: null,
        tabBarLabel: Platform.OS == 'android' ? ({ tintColor, focused }) => (
            <Text style={{ fontSize: 10, color: focused ? tintColor : '#95a5a6' }}>
                PRODUCTOS
            </Text>
        ) : "PRODUCTOS",
        tabBarIcon: ({ tintColor, focused }) => (
            <IconMaterial
                name={focused ? 'food' : 'food'}
                size={25}
                color={focused ? tintColor : '#95a5a6'}
            />
        ),
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            categorias_padre: [],
            categorias: [],
            productos_selec: store.getState().productos.filter(p => p.Cod_Mesa == store.getState().Cod_Mesa),
            cantidad_items: 0
        }
    }
    componentWillMount() {
        this.RecuperarCategoriasPadre()
        this.CalcularTotal()

    }
    componentDidMount() {
        store.subscribe(() => {
            if(this.refs.pedidos_ref)
                this.CalcularTotal()
        })
    }
    CalcularTotal = () => {
        productos = store.getState().productos.filter(p => p.Cod_Mesa == store.getState().Cod_Mesa)
        this.setState({
            total: productos.reduce((a, b) => a + (b.PrecioUnitario * b.Cantidad), 0),
            cantidad_items: productos.reduce((a, b) => a + (b.Cantidad), 0),
        })

    }
    RecuperarCategoriasPadre = () => {
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }
        fetch(URL_WS + '/get_categorias_padre', parametros)
            .then((response) => response.json())
            .then((data) => {
                categorias = data.categorias.filter((c, index) => {
                    if (index == 0)
                        c["Seleccionado"] = 1
                    else
                        c["Seleccionado"] = 0
                    return c
                })
                this.setState({
                    categorias_padre: categorias
                }, () => {
                    this.RecuperarCategoriasHijas(data.categorias[0].Cod_Categoria)
                })
                //Cod_Categoria: "HEL", Des_Categoria
            })
    }
    RecuperarCategoriasHijas = (cod_categoria_padre) => {
        this.setState({ productos: [] })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_Categoria: cod_categoria_padre
            })
        }
        fetch(URL_WS + '/get_categorias_hijas', parametros)
            .then((response) => response.json())
            .then((data) => {
                categorias = data.categorias.filter((c, index) => {
                    c["Seleccionado"] = 0
                    return c
                })
                this.setState({
                    categorias: categorias
                } //, () => {this.RecuperarProductosXCategoria(categorias[0].Cod_Categoria)}
                )
                //Cod_Categoria: "HEL", Des_Categoria
            })
    }
    SeleccionarCategoriaPadre = (Cod_Categoria) => {
        this.RecuperarCategoriasHijas(Cod_Categoria)
        var categorias = this.state.categorias_padre.filter(c => {
            if (c.Cod_Categoria == Cod_Categoria)
                c["Seleccionado"] = 1
            else
                c["Seleccionado"] = 0
            return c
        })
        this.setState({ categorias_padre: [] }, () => this.setState({ categorias_padre: categorias }))
    }
    SeleccionarCategoriaHija = (Cod_Categoria, Seleccionado) => {
        if (Seleccionado != 1) {
            this.RecuperarProductosXCategoria(Cod_Categoria)
        }

        var categorias = this.state.categorias.filter(c => {
            if (c.Cod_Categoria == Cod_Categoria)
                c["Seleccionado"] = Seleccionado == 1 ? 0 : 1
            else
                c["Seleccionado"] = 0
            return c
        })
        this.setState({ categorias: [] }, () => this.setState({ categorias: categorias }))
    }
    RecuperarProductosXCategoria = (Cod_Categoria) => {
        this.setState({ buscando: true, productos: [] })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_Categoria: Cod_Categoria
            })
        }
        fetch(URL_WS + '/get_productos_by_categoria', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ productos: data.productos, buscando: false })
            })
    }
    render() {
        const { navigate } = this.props.navigation;
        const { productos_selec } = this.props.navigation.state.params;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#2c2c54"
                    barStyle="default"
                />
                <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: '#40407a', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffeaa7', flex: 1, marginHorizontal: 10, fontWeight: 'bold', alignSelf: 'center' }}>{store.getState().Nom_Mesa}</Text>
                    
                </View>
                {/*<View style={{ backgroundColor: '#40407a' }}>
                    <ScrollView horizontal={true} >
                        {this.state.categorias_padre.map((c, index) =>
                            <TouchableOpacity onPress={() => this.SeleccionarCategoriaPadre(c.Cod_Categoria)}
                                activeOpacity={0.7} style={{ backgroundColor: '#40407a', marginRight: 1 }} key={c.Cod_Categoria}>
                                <Text style={{ color: c.Seleccionado == 1 ? '#55efc4' : '#95a5a6', paddingHorizontal: 5, paddingVertical: 10 }}>{c.Des_Categoria}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>*/}
                <View style={{ backgroundColor: '#FFF', flex: 1 }}>

                    <ScrollView  >
                        {this.state.categorias.map((c, index) =>
                            <View key={c.Cod_Categoria}>
                                <TouchableOpacity onPress={() => this.SeleccionarCategoriaHija(c.Cod_Categoria, c.Seleccionado)}
                                    activeOpacity={0.7} style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', marginRight: 1 }}>

                                    <Text style={{ color: c.Seleccionado == 1 ? '#1abc9c' : '#95a5a6', flex: 1, fontWeight: 'bold', paddingHorizontal: 5, marginLeft: 10, paddingVertical: 10 }}>{c.Des_Categoria}</Text>
                                    <IconMaterial
                                        name={c.Seleccionado != 1 ? 'chevron-down' : 'chevron-up'}
                                        size={25} style={{ marginHorizontal: 10 }}
                                        color={c.Seleccionado == 1 ? '#1abc9c' : '#95a5a6'}
                                    />

                                </TouchableOpacity>
                                {c.Seleccionado == 1 &&
                                    <View>
                                        {this.state.buscando && <ActivityIndicator color="#333" size="large" style={{ alignSelf: 'center', paddingVertical: 10 }} />
                                        }

                                        <FlatList
                                            data={this.state.productos}
                                            renderItem={({ item }) => (
                                                <Producto producto={item} Cod_Mesa={store.getState().Cod_Mesa} navigate={navigate} />
                                            )}
                                            keyExtractor={(item, index) => index}
                                        />
                                    </View>}
                            </View>

                        )}
                    </ScrollView>
                    <View ref="pedidos_ref" >
                    {parseFloat(this.state.total) > 0 &&
                        <TouchableOpacity activeOpacity={0.8}
                            style={{
                                height: 50, elevation: 10, backgroundColor: '#40407a',
                                borderRadius: 5, marginHorizontal: 10, marginBottom: 10,
                                flexDirection: 'row', alignItems: 'center'
                            }}>
                            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginHorizontal: 10 }}>
                                <Text style={{ fontWeight: 'bold', color: '#55efc4' }}>Ver Items ({this.state.cantidad_items})</Text>
                            </View>

                            <Text style={{ marginHorizontal: 10, fontWeight: 'bold', color: '#55efc4' }}>Total {(this.state.total).toFixed(2)}</Text>
                        </TouchableOpacity>
                    }
                    </View>
                </View>



            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
});