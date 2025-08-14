const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const nodemailer = require('nodemailer');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuración para Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'davidantonioflores71@gmail.com', // ⬅️ Reemplaza con tu correo
        pass: 'iryj jodp wnux vevn' // ⬅️ Reemplaza con la contraseña de aplicación
    }
});

console.log("Servidor iniciado y escuchando nuevos pedidos...");

db.collection('orders').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      const newOrder = change.doc.data();
      const orderId = change.doc.id; // La variable orderId se define aquí.
      
      console.log(`¡Nuevo pedido detectado! ID del pedido: ${orderId}`);
      console.log("Datos del pedido:", newOrder);

      // Ahora la variable orderId es accesible aquí dentro
      const mailOptions = {
          from: 'davidantonioflores71@gmail.com',
          to: ['davidantonioflores71@gmail.com', 'manuelf16062004@gmail.com'],
          subject: `Nuevo Pedido Recibido #${orderId}`, // La variable orderId ahora es válida.
          html: `
            <h1>¡Se ha recibido un nuevo pedido!</h1>
            <p><b>ID del pedido:</b> ${orderId}</p>
            <p><b>Nombre del cliente:</b> ${newOrder.username}</p>
            <p><b>Total del pedido:</b> $${newOrder.total}</p>
            <p><b>Método de pago:</b> ${newOrder.paymentMethod}</p>
            
            <h2>Dirección de envío:</h2>
            <p><b>Ciudad:</b> ${newOrder.userAddress.city}</p>
            <p><b>Colonia:</b> ${newOrder.userAddress.colony}</p>
            <p><b>Calle:</b> ${newOrder.userAddress.street}</p>
            <p><b>Número:</b> ${newOrder.userAddress.number}</p>
            
            <h2>Artículos del pedido:</h2>
            <ul>
              ${newOrder.cartItems.map(item => `<li>${item.name} - Cantidad: ${item.quantity} - Precio: $${item.price}</li>`).join('')}
            </ul>
          `
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error("Error al enviar el correo:", error);
          } else {
              console.log("Correo de notificación enviado:", info.response);
          }
      });
    }
  });
});