# Imagen base de Node
FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias primero (mejor caching)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto al contenedor
COPY . .

# Exponer el puerto de tu API 
EXPOSE 3000

# Comando para arrancar la app
CMD ["npm", "start"]