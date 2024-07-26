import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolver.js';
import dotenv from 'dotenv';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import bodyParser from 'body-parser';
import compression from 'compression';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { makeExecutableSchema } from '@graphql-tools/schema';
dotenv.config();
async function init() {
    const app = express();
    const Port = process.env.PORT || 4000;
    const URL = process.env.URL;
    const httpsServer = http.createServer(app);
    // Create the schema
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const server = new ApolloServer({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer: httpsServer })],
    });
    await server.start();
    const subscriptionServer = SubscriptionServer.create({
        schema,
        execute,
        subscribe,
        onConnect: (connectionParams, webSocket, context) => {
            console.log('WebSocket connected');
        },
        onDisconnect: (webSocket, context) => {
            console.log('WebSocket disconnected');
        },
    }, {
        server: httpsServer,
        path: '/graphql',
    });
    app.use(bodyParser.json({ limit: '500mb' }));
    app.use(bodyParser.urlencoded({ limit: '500mb', extended: false }));
    app.use(compression());
    app.use(graphqlUploadExpress());
    const allowedOrigins = ['https://client-legitem-lw0uq0cf4-roberts-projects-a9f97a7e.vercel.app', 'http://localhost:3000', 'https://newone-ashen-rho.vercel.app'];
    app.use('/graphql', cors({
        origin: "*",
        credentials: true,
    }), express.json(), expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }));
    app.use(express.static('json'));
    app.use(express.static('model'));
    app.use(express.static('model/category_images'));
    await new Promise((resolve) => httpsServer.listen(Port, resolve));
    console.log(`🚀 Server ready at ${URL}:${Port}/graphql`);
}
init();
