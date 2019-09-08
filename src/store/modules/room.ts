import { RoomData, GamePhase, collections } from "@/components/KeyValueService";
import { vuexfireMutations, firestoreAction } from 'vuexfire'
import { db } from '@/components/Firestore';
import './firebaseExtensions';

const state = {
    roomId: undefined,
    isBound: false,
    data: new RoomData(),
    decks: {
        selected: new Array<number>(),
        activeRemaining: new Array<number>(),
        activeGuessed: new Array<number>(),
        discard: new Array<number>(),
    },
    players: [],
}

const actions = {
    createRoom: firestoreAction(async (context) => {
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
    }),
    setPhase: async (context, payload: { roomId: string, phase: GamePhase} ) => {
        return collections.room(payload.roomId).update({ data: { phase: payload.phase.toString() }} );
    },
    addPlayer: async (context, { roomId, playerId }) => {
        console.log(`room.addPlayer() - adding player ${playerId} to room ${roomId}`)
        const roomDocument = await collections.room(roomId);

        // const existingPlayers = (await roomDocument.get()).players;
        const existingPlayers = state.players;

        const allPlayers = existingPlayers.concat([ playerId ]);

        await roomDocument.update({ players: allPlayers });
    },
    addToDeck: ({ state }, { cards, deck }: { cards: Array<number>, deck: string}) => {
        console.log(`room.actions.addToDeck(): Adding to deck '${deck}`, cards);
        console.log("Existing Deck", state.decks[deck]);
        const newDeck = state.decks[deck].concat(cards);
        console.log("New Deck", newDeck);
        
        const allDecks = Object.assign({}, state.decks, { [deck]: newDeck });

        return db.collection('rooms').doc(state.roomId).update({ decks: allDecks });
    }
}

const mutations = {
    setRoomId (state: any, id: number) {
        state.roomId = id;
    }
}

export const  getRandomIntInclusive = (min: number, max: number)  => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
    namespaced: true,
    state,
    actions,
    getters: {},
    mutations
}