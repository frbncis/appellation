import { RoomData, GamePhase, collections } from "@/components/KeyValueService";
import { firestoreAction } from 'vuexfire'
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
import { db } from '@/components/Firestore';
import './firebaseExtensions';
import { FirestoreAction } from './FirebaseAction';

// const state = {
//     roomId: undefined,
//     isBound: false,
//     data: new RoomData(),
//     decks: {
//         selected: new Array<number>(),
//         activeRemaining: new Array<number>(),
//         activeGuessed: new Array<number>(),
//         discard: new Array<number>(),
//     },
//     players: [],
// }

// const actions = {
//     createRoom: firestoreAction(async (context) => {
//         const roomId = getRandomIntInclusive(1000, 9999).toString();
//         const roomDocument = collections.room(roomId);

//         await roomDocument.set({
//             roomId: roomId,
//             isBound: true,
//             data: Object.assign({}, new RoomData()),
//             decks: {
//                 selected: new Array<number>(),
//                 activeRemaining: new Array<number>(),
//                 activeGuessed: new Array<number>(),
//                 discard: new Array<number>(),
//             },
//             players: [],
//         });

//         return roomId;
//     }),
//     setPhase: async (context, payload: { roomId: string, phase: GamePhase} ) => {
//         return collections.room(payload.roomId).update({ data: { phase: payload.phase.toString() }} );
//     },
//     addPlayer: async (context, { roomId, playerId }) => {
//         console.log(`room.addPlayer() - adding player ${playerId} to room ${roomId}`)
//         const roomDocument = await collections.room(roomId);

//         // const existingPlayers = (await roomDocument.get()).players;
//         const existingPlayers = state.players;

//         const allPlayers = existingPlayers.concat([ playerId ]);

//         await roomDocument.update({ players: allPlayers });
//     },
//     addToDeck: ({ state }, { cards, deck }: { cards: Array<number>, deck: string}) => {
//         console.log(`room.actions.addToDeck(): Adding to deck '${deck}`, cards);
//         console.log("Existing Deck", state.decks[deck]);
//         const newDeck = state.decks[deck].concat(cards);
//         console.log("New Deck", newDeck);
        
//         const allDecks = Object.assign({}, state.decks, { [deck]: newDeck });

//         return db.collection('rooms').doc(state.roomId).update({ decks: allDecks });
//     }
// }

// const mutations = {
//     setRoomId (state: any, id: number) {
//         state.roomId = id;
//     }
// }

export const  getRandomIntInclusive = (min: number, max: number)  => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface RoomDecks {
    selected: Array<number>;
    activeRemaining: Array<number>;
    activeGuessed: Array<number>;
    discard: Array<number>;
}

interface RoomState {
    roomId?: string, 
    isBound: boolean,
    data: RoomData,
    decks: RoomDecks,
    players: Array<string>,
}

@Module({ name: 'room', namespaced: true })
export class RoomModule extends VuexModule {
    public data: RoomState = {
        roomId: undefined,
        isBound: false,
        data: new RoomData(),
        decks: {
            selected: new Array<number>(),
            activeRemaining: new Array<number>(),
            activeGuessed: new Array<number>(),
            discard: new Array<number>(),
        },
        players: new Array<string>(),
    } 
    
    @FirestoreAction
    public async bindReference(roomId: string) {
        console.log('Binding room reference');

        const { bindFirestoreRef } = this.context;

        const roomDocument = db.collection('rooms').doc(roomId);
        await bindFirestoreRef('data', roomDocument);
    }

    @Action
    public async createRoom() {
        const roomId = getRandomIntInclusive(1000, 9999).toString();
        const roomDocument = collections.room(roomId);

        await roomDocument.set({
            roomId: roomId,
            isBound: true,
            data: Object.assign({}, new RoomData()),
            decks: {
                selected: new Array<number>(),
                activeRemaining: new Array<number>(),
                activeGuessed: new Array<number>(),
                discard: new Array<number>(),
            },
            players: [],
        });

        return roomId;
    }

    @Action
    public async setPhase(payload: { roomId: string, phase: GamePhase}) {
        return collections.room(payload.roomId).update({ data: { phase: payload.phase.toString() }} );
    }

    @Action
    public async addPlayer(payload: { roomId: string, playerId: string }) {
        const { roomId, playerId } = payload;

        console.log(`room.addPlayer() - adding player ${playerId} to room ${roomId}`)
        const roomDocument = await collections.room(roomId);

        // const existingPlayers = (await roomDocument.get()).players;
        const existingPlayers = this.data.players;

        const allPlayers = existingPlayers.concat([ playerId ]);

        await roomDocument.update({ players: allPlayers });
    }

    @Action
    public addToDeck(payload: { cards: Array<number>, deck: string }) {
        if (!this.data.roomId) {
            throw new Error("Room ID not set.");
        }
        
        const { deck, cards } = payload;

        console.log(`room.actions.addToDeck(): Adding to deck '${deck}`, cards);

        console.log("Existing Deck", this.data.decks[deck]);
        const newDeck = this.data.decks[deck].concat(cards);
        console.log("New Deck", newDeck);
        
        const allDecks = Object.assign({}, this.data.decks, { [deck]: newDeck });

        return db.collection('rooms').doc(this.data.roomId!.toString()).update({ decks: allDecks });
    }

    @Mutation
    public setRoomId(id: number) {
        this.data.roomId = id.toString();
    }
}