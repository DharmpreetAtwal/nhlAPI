import { player_info } from "@prisma/client";

export interface IPlayerService {
    getAllPlayers(limit: number, nextCursor?: number): Promise<{
        data: player_info[];
        nextCursor: number | null;
    }>;

    getPlayerById(id: string | string[]): Promise<player_info>;

    getPlayersByNationality(
        nation: string | string[],
        limit: number,
        nextCursor?: number
    ): Promise<{
        data: player_info[];
        nextCursor: number | null;
    }>;
}