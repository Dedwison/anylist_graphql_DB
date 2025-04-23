<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

#Dev
1. Clonar el proyecto
2. Copiar el ```.env.template``` y renombrar a ```.env```
3. Ejecutar 
```
yarn install
```
4. Leventar la imagen Docker
```
docker compose up -d
```
5. Levantar el backend de Nest
```
yarn start:dev
```
6. Visitar el sitio
```
localhost:3000/graphql
```
7. Ejecutar la __"mutation"__ executedSeed, para llenar la base de datos con información.


# Docker istructions
1. Comando de construcción:
```
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build
```

2. Comando para levantar:
````
docker compose -f docker-compose.prod.yml --env-file .env.prod up
```

3. Cambiar nombre
```
docker tag <nombre app> <usuario docker hub>/<nombre repositorio>
```

4. Ingresar a Docker:
```
docker login
```

5. Subir Imagen:
```
docker push <usuario docker hub>/<nombre repositorio>
```