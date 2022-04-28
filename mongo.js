const express = require("express")
const app = express()
let {config} = require("./config");
let controller = require("./components/controllers/controller")
let db_knex = require("./config/database")
let sqlite_knex = require("./config/dbSqlite")
let moment = require("moment")
let cors = require("cors")
let path = require('path')
let {Server: HttpServer} = require('http')
let {Server:SocketIO} = require('socket.io');
let {schema, normalize, denormalize} = require("normalizr")
let inspect =require("./utils/inspect");
//let baseChat = require("./DB/datosChat")

let mensajeModel = require("./DB/mongoose")
const PORT = config.port;


app.use(cors("*"));
console.log(PORT);

app.use(express.json());                    
app.use(express.urlencoded({extended:true}));

app.set("views", path.join(__dirname,"./views/ejs"));
app.set("view engine", "ejs");


let http = new HttpServer(app);
let io = new SocketIO(http);
    let chatMensajes = "";
    
    

 async function leerBase(){
    try{
       
        let mensajes =  await mensajeModel.find({})
        .then((data)=> chatMensajes = data)
        .then((dato)=> normalizar(dato))
        
        
   }catch(error){
       console.log(error)
   }
}


 // Nueva coneccion
io.on("connection", socket =>{
    console.log("Nuevo cliente conectado:", socket.id)
    leerBase(); 
    socket.emit("iniciarChat",chatMensajes);
    

// carga los datos de iniciales
    
db_knex.from('productos').select("*")
        .then((rows)=>{
            //console.log(rows)
            //socket.emit("produc",rows)
           
        })
    
 controller.test()
        .then(array => socket.emit("produc",array))
        .catch(error => console.log(error))

 
    // inserta datos en BD
    socket.on("datos",data =>{
        db_knex('productos').insert(data)
        .then(()=>console.log("dato insertado"))
        .catch((err)=> {console.log(err); throw err})

            io.sockets.emit("tabla",data)
        }) 
//------------------------------------------------------------
 

    // inserta datos en chat
        socket.on("nuevoChat",data =>{
            datos={
                ...data,
                hora: moment().format("YYYY-MM-DD HH:mm:ss")
            }
            console.log(datos);

                        console.log("entrando a la funcion ");
                        const mensajeSavemodel =new mensajeModel(datos);
                        let mensajeSave = mensajeSavemodel.save()
                        //console.log(mensajeSave)
          
                    .then(()=>console.log("mensaje insertado"))
                    .catch((err)=> {console.log(err); throw err})

            io.sockets.emit("mensaje",datos)
           
        })
})
   


 //Normalizacion

    function normalizar(data){
        console.log("entrando a normalizar")

    const authores = new schema.Entity('authores')
    const usuarios =  new schema.Entity('user',{authores:[authores]} )
 
        let resultado_normalizado = normalize(data, usuarios)
        inspect(resultado_normalizado);
        console.log("Longitud nNormal ---->", JSON.stringify(data).length)
        console.log("Longitud Normalizado ---->", JSON.stringify(resultado_normalizado).length)
    }
    

 //renderizar pagina
 app.get("/", (req,res,next) =>{
    res.render("index", {});   
})


app.get("/api/productos-test",(req,res,next)=>{
    res.render("tablaaleatoria",{})
})


http.listen(PORT, ()=>{
    console.log(`estamos escuchando en esta url: http://localhost:${PORT}`)
})