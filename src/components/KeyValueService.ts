
import { db } from './Firestore';

export const collections = {
    players: function (roomId: string) { return db.collection(`rooms/${roomId}/players`) },


};

export class KeyValueService {
    private _roomId?: string;

    private isMaster = false;

    public players = db.collection('players');

    public get roomId() {
        return this._roomId;
    }

    public async createRoomAsync(): Promise<string> {
        this._roomId = this.getRandomIntInclusive(1000, 9999).toString();

        return this._roomId;
    }

    public joinRoomAsync(roomId: string) {
        this._roomId = roomId;
    }

    public async setPlayerAsync(roomId: string, name: string) {
        if (!roomId) {
            throw Error("Room not set.");
        }

        db.collection(`rooms/${roomId}/players`).add({
            name,
            teamId: 1
        });

        // const playerIdRequest = await fetch(`${this.ApiBaseUrl}/${this.roomId}/playerCount`, {
        //     method: 'PATCH',
        //     body: '+1',
        // });

        // const playerId = await playerIdRequest.text();

        // console.log(`Player ID assigned: ${playerId}`);

        // if (parseInt(playerId) == 1) {
        //     this.isMaster = true;
        // }

        // await fetch(`${this.ApiBaseUrl}/${this.roomId}/player_${playerId}`, {
        //     method: 'POST',
        //     body: name,
        // });

        // await fetch(`${this.ApiBaseUrl}/${this.roomId}/player_${playerId}_candidateCards`, {
        //     method: 'POST',
        // });
    }

    public async getPlayerId(name: string) {


    }

    // public async getPlayersAsync() {
    //     if (!this._roomId) {
    //         return null;
    //     }

    //     const players =  db.collection(`rooms/${this._roomId}/players`);

    //     console.log(players);
    //     return players;
    //     // const playerCount = parseInt(await (await fetch(`${this.ApiBaseUrl}/${this.roomId}/playerCount`)).text());

    //     // console.log(`Player count in room: ${playerCount}.`);

    //     // const players = [];

    //     // for(let i = 1; i <= playerCount; i++) {
    //     //     const playerRequest = await fetch(`${this.ApiBaseUrl}/${this.roomId}/player_${i}`);

    //     //     const name = await playerRequest.text();

    //     //     // this belongs elsewhere.
    //     //     if (this.isMaster) {
    //     //         const playerRequest = await fetch(`${this.ApiBaseUrl}/${this.roomId}/player_${i}_candidateCards`);

    //     //         const cards = await playerRequest.text();
    
    //     //         if (cards == '') {
    //     //             console.log(`Player ID=${i} (Name=${name}) does not have candidate cards.`);
    //     //         }
    //     //     }

    //     //     players.push(name);
    //     // }

    //     // return players;
    // }

    private getRandomIntInclusive(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


}