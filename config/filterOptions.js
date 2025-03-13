export const typeOptions = {
    id: 'tipo_propiedad',
    title: 'Tipo de propiedad',
    icon: 'House',
    values: [   
        {title: "Casa", id:"casa"},
        {title: "Apartamento", id:"apartamento"},
        {title: "Duplex", id: "duplex"},
        {title: "Oficina", id: "oficina"},
        {title: "Local Comercial", id: "local_comercial"},
        {title: "Cochera", id: "cochera"},
        {title: "Terreno", id: "terreno"},
        {title: "Campo", id: "campo"},
        {title: "Galpon", id: "galpon"},
    ]
};

export const operationOptions = {
    id: 'operation',
    title: 'Operación',
    icon: 'Handshake',
    values:[
        {title: "Vender", id : "vender"},
        {title: "Comprar", id: "comprar"},
        {title: "Alquilar", id :"alquilar"},
        {title: "Permuta", id: "permutar"},
    ]
};

export const quantitysFilter = [
    {
        id: 'bathrooms',
        title: 'Baños',
        icon : 'Toilet',
        min : 0,
        max : 12
    },
    {
        id: 'bedrooms',
        title: 'Dormitorios',
        icon : 'BedDouble',
        min : 0,
        max : 12
    },
    {
        id: 'area',
        title: 'Area Total',
        icon : 'Scaling',
        min : 0,
        max : 10
    },
    {
        id: 'builtArea',
        title: 'Area Construida',
        icon : 'ImageUpscale',
        min : 0,
        max : 10
    },
    {
        id: 'price',
        title: 'Precio',
        icon : 'DollarSign',
        min : 0,
        max : 50000000
    },
]
