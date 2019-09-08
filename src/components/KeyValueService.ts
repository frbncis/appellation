
import { db } from './Firestore';

export const collections = {
    room: function(roomId: string) { return db.collection(`rooms`).doc(roomId) },
    players: function (roomId: string) { return db.collection(`rooms/${roomId}/players`) },
    player: function (roomId: string, playerId?: string) { 
        if (playerId)
            return db.collection(`rooms/${roomId}/players`).doc(playerId);
        else
            return db.collection(`rooms/${roomId}/players`).doc();
    },
    public_player_data: function (roomId: string, playerId: string, phase: string) { 
        return db.collection(`rooms/${roomId}/players/${playerId}/publicGameData`).doc(phase);
    },
    phase: function (roomId: string, phase: string) { 
        return db.collection(`rooms/${roomId}/phase_${phase}`);
    },
};

export enum GamePhase {
    Setup,
    Guessing,
    Ended,
}

export class RoomData implements IRoomData {
    roomCreatedTimestamp = new Date();
    // dealtCandidateCards = [];
    // cardDeckIds = [];
    // cardDeckRemainingIds = [];
    currentTeamId = -1;
    scoreTeam1 = 0;
    scoreTeam2 = 0;
    phase = GamePhase.Setup;
}

export interface IRoomData {
    id?: string,
    roomCreatedTimestamp?: Date,
    dealtCandidateCards: Array<number>;

    /**
     * IDs of all the cards in the full deck.
     */
    cardDeckIds: Array<number>;

    /**
     * IDs of the card deck actively being played out of.
     */
    cardDeckRemainingIds: Array<number>;

    /**
     * ID of the team currently guessing.
     */
    currentTeamId: number;

    /**
     * Team 1's score
     */
    scoreTeam1: number;

    /**
     * Team 2's score
     */
    scoreTeam2: number;

    phase: GamePhase;
}

export interface PlayerData {
    id?: string,
    name?: string,
    teamId?: number,
    hasSubmittedCards: boolean,
    teamSequenceId: number,
}

export class KeyValueService {
    private _roomDocument?: firebase.firestore.DocumentReference;
    private _playerDocument?: firebase.firestore.DocumentReference;

    public players?: Array<PlayerData>;

    // public async createRoomAsync(): Promise<string> {
    //     const roomId = this.getRandomIntInclusive(1000, 9999).toString();

    //     this._roomDocument = collections.room(roomId);
        
    //     const initialRoomState = new RoomData();

    //     await this._roomDocument.set(Object.assign({}, initialRoomState));

    //     return roomId;
    // }

    // public async joinRoomAsync(roomId: string) {
    //     this._roomDocument = collections.room(roomId);
    // }

    // public async setPlayerAsync(roomId: string, name: string): Promise<firebase.firestore.DocumentReference> {
    //     if (!this._roomDocument) {
    //         throw Error("Room not set.");
    //     }

    //     if (this._playerDocument) {
    //         throw Error("Player already set.");
    //     }

    //     let team1PlayerCount = 0;
    //     let team2PlayerCount = 0;

    //     (await collections.players(roomId).get()).forEach(async (p) => {
    //         const teamId = p.get('teamId');

    //         if (teamId == 1) {
    //             team1PlayerCount++;
    //         } else {
    //             team2PlayerCount++;
    //         }
    //     });

    //     const assignedTeamId = team1PlayerCount < team2PlayerCount ? 1 : 2;

    //     const playerDocument = collections.player(roomId, undefined);

    //     const player = {
    //         id: playerDocument.id,
    //         name,
    //         teamId: assignedTeamId,
    //         hasSubmittedCards: false,
    //     };

    //     await playerDocument.set(player);
        
    //     console.log("Player Set!", player);

    //     this._playerDocument = playerDocument;

    //     return playerDocument;
    // }

    public async switchTeamsAsync() {
        if (!this._playerDocument) {
            throw new Error("Player not set.");
        }

        const player = <PlayerData>(await this._playerDocument.get()).data();

        this._playerDocument.set(Object.assign({}, player, {
            teamId: player.teamId == 1 ? 2 : 1,
        }))
    }
    /**
     * Get secrets cards to select from.
     */
    public async getCandidateCards() {
        // if (!this._roomDocument) {
        //     throw new Error("Room not set.");
        // }

        // const room = <RoomData><unknown>((await this._roomDocument.get()).data());

        const candidateCards = new Array<number>(10).fill(0);

        for (let i = 0; i < candidateCards.length; i++) {
            while (true) {
                const j = this.getRandomIntInclusive(0, 50);

                if (room.dealtCandidateCards.findIndex((value) => value == j) > -1) {
                    continue;
                }
                else if (candidateCards.findIndex((value) => value == j) > -1) {
                    continue;
                }
                else {
                    candidateCards[i] = <any>j;
                    break;
                }
            }
        }

        await this._roomDocument.set(Object.assign({}, room, {
            dealtCandidateCards: room.dealtCandidateCards.concat(candidateCards),
        }));

        return candidateCards;
    }

    /**
     * Submits the secret cards to form a part of the play deck.
     * @param selectedCardIds 
     */
    public async submitCardIdsAsync(selectedCardIds: Array<number>): Promise<void> {
        if (!this._roomDocument) {
            throw new Error("Room not set.");
        }

        if (!this._playerDocument) {
            throw new Error("Player not set");
        }
        const room = <RoomData><unknown>((await this._roomDocument.get()).data());

        await this._roomDocument.set(Object.assign({}, room, {
            cardDeckIds: room.cardDeckIds.concat(selectedCardIds),
        }));

        const updatedPlayer = Object.assign({}, <PlayerData>(await this._playerDocument.get()).data(), {
            hasSubmittedCards: true
        });

        await this._playerDocument.set(updatedPlayer);

        return;
    }

    private getRandomIntInclusive(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}