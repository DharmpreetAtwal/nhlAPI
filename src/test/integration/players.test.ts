import request from 'supertest';
import { app } from '../../app';

describe('GET /v1/players/all (Integration)', () => {
  describe('Data correctness', () => {
    it('should return players from database with correct structure', async () => {
      const response = await request(app).get('/v1/players/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('data');
      expect(response.body.result).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });

    it('should return player objects with required fields', async () => {
      const response = await request(app).get('/v1/players/all?limit=5');

      expect(response.status).toBe(200);
      const players = response.body.result.data;

      players.forEach((player: any) => {
        expect(player).toHaveProperty('player_id');
        expect(player).toHaveProperty('first_name');
        expect(player).toHaveProperty('last_name');
        expect(player).toHaveProperty('nationality');
        expect(player).toHaveProperty('primary_position');
        expect(typeof player.player_id).toBe('number');
        expect(typeof player.first_name).toBe('string');
        expect(typeof player.last_name).toBe('string');
        expect(typeof player.nationality).toBe('string');
      });
    });

    it('should return default limit of 10 when no limit specified', async () => {
      const response = await request(app).get('/v1/players/all');

      expect(response.status).toBe(200);
      const players = response.body.result.data;
      expect(players.length).toBeLessThanOrEqual(10);
    });

    it('should respect custom limit parameter', async () => {
      const limit = 5;
      const response = await request(app).get(`/v1/players/all?limit=${limit}`);

      expect(response.status).toBe(200);
      const players = response.body.result.data;
      expect(players.length).toBeLessThanOrEqual(limit);
    });

    it('should cap limit to 20 when requesting more than 20', async () => {
      const response = await request(app).get('/v1/players/all?limit=50');

      expect(response.status).toBe(200);
      const players = response.body.result.data;
      expect(players.length).toBeLessThanOrEqual(20);
    });

    it('should return players in ascending order by player_id', async () => {
      const response = await request(app).get('/v1/players/all?limit=20');

      expect(response.status).toBe(200);
      const players = response.body.result.data;

      for (let i = 1; i < players.length; i++) {
        expect(players[i].player_id).toBeGreaterThanOrEqual(players[i - 1].player_id);
      }
    });

    it('should provide nextCursor when more players exist', async () => {
      const response = await request(app).get('/v1/players/all?limit=5');

      expect(response.status).toBe(200);
      const { nextCursor, data } = response.body.result;

      if (data.length === 5) {
        expect(nextCursor).toBeDefined();
        expect(typeof nextCursor).toBe('number');
      }
    });

    it('should return null nextCursor when at end of results', async () => {
      const firstResponse = await request(app).get('/v1/players/all?limit=5&nextCursor=8481812');
      const firstPlayers = firstResponse.body.result.data;

      if (firstPlayers.length < 5) {
        expect(firstResponse.body.result.nextCursor).toBeNull()
      }
    });
  });

  describe('Pagination', () => {
    it('should retrieve different players using nextCursor', async () => {
      const firstResponse = await request(app).get('/v1/players/all?limit=3');
      const firstPlayers = firstResponse.body.result.data;
      const nextCursor = firstResponse.body.result.nextCursor;

      if (nextCursor) {
        const secondResponse = await request(app).get(`/v1/players/all?limit=3&nextCursor=${nextCursor}`);
        const secondPlayers = secondResponse.body.result.data;

        expect(secondResponse.status).toBe(200);
        expect(secondPlayers.length).toBeGreaterThan(0);

        // Players from second page should have higher IDs than first page
        const firstPageMaxId = Math.max(...firstPlayers.map((p: any) => p.player_id));
        const secondPageMinId = Math.min(...secondPlayers.map((p: any) => p.player_id));
        expect(secondPageMinId).toBeGreaterThan(firstPageMaxId);
      }
    });

    it('should handle cursor at specific player_id', async () => {
      const firstResponse = await request(app).get('/v1/players/all?limit=2');
      const players = firstResponse.body.result.data;

      if (players.length === 2) {
        const cursorPlayerId = players[1].player_id;
        const paginatedResponse = await request(app).get(`/v1/players/all?limit=5&nextCursor=${cursorPlayerId}`);

        expect(paginatedResponse.status).toBe(200);
        const paginatedPlayers = paginatedResponse.body.result.data;
        expect(paginatedPlayers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Query parameter validation', () => {
    it('should reject negative limit', async () => {
      const response = await request(app).get('/v1/players/all?limit=-5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject negative nextCursor', async () => {
      const response = await request(app).get('/v1/players/all?nextCursor=-10');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-integer limit', async () => {
      const response = await request(app).get('/v1/players/all?limit=5.5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-numeric limit', async () => {
      const response = await request(app).get('/v1/players/all?limit=abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject zero limit', async () => {
      const response = await request(app).get('/v1/players/all?limit=0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });
  });

  describe('Response format', () => {
    it('should always include success field as true for valid requests', async () => {
      const response = await request(app).get('/v1/players/all');

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should have properly structured data object', async () => {
      const response = await request(app).get('/v1/players/all?limit=1');

      expect(response.body.result).toHaveProperty('data');
      expect(response.body.result).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });
  });
});

describe('GET /v1/players/:id (Integration)', () => {
  describe('Data Correctness', () => {
    it('should return player from database with correct structure', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');

      const result = response.body.result
      expect(result).toHaveProperty('player_id');
      expect(result).toHaveProperty('first_name');
      expect(result).toHaveProperty('last_name');
      expect(result).toHaveProperty('nationality');
      expect(result).toHaveProperty('primary_position');
      expect(typeof result.player_id).toBe('number');
      expect(typeof result.first_name).toBe('string');
      expect(typeof result.last_name).toBe('string');
      expect(typeof result.nationality).toBe('string');
    });

    it('should return correct player ID in response', async () => {
      const playerId = 8444894;
      const response = await request(app).get(`/v1/players/${playerId}`);

      expect(response.status).toBe(200);
      expect(response.body.result.player_id).toBe(playerId);
    });

    it('should return player with all required fields populated', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      const player = response.body.result;

      expect(player.player_id).toBeDefined();
      expect(player.player_id).not.toBeNull();
      expect(player.first_name).toBeDefined();
      expect(player.first_name).not.toBeNull();
      expect(player.last_name).toBeDefined();
      expect(player.last_name).not.toBeNull();
      expect(player.nationality).toBeDefined();
      expect(player.primary_position).toBeDefined();
    });

    it('should return different players for different IDs', async () => {
      const response1 = await request(app).get('/v1/players/8444894');
      const response2 = await request(app).get('/v1/players/8469608');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const player1 = response1.body.result;
      const player2 = response2.body.result;

      expect(player1.player_id).not.toBe(player2.player_id);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent player ID', async () => {
      const response = await request(app).get('/v1/players/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for non-numeric ID', async () => {
      const response = await request(app).get('/v1/players/abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app).get('/v1/players/-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for decimal ID', async () => {
      const response = await request(app).get('/v1/players/8444894.5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for ID with special characters', async () => {
      const response = await request(app).get('/v1/players/8444@94');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format', () => {
    it('should always return success field', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should return result object not wrapped in array', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.result)).toBe(false);
      expect(typeof response.body.result).toBe('object');
    });

    it('should return player object directly in result', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      const result = response.body.result;

      expect(result).toHaveProperty('player_id');
      expect(result).not.toHaveProperty('data');
      expect(result).not.toHaveProperty('nextCursor');
    });
  });

  describe('Data Types and Validation', () => {
    it('should return player_id as number', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      expect(typeof response.body.result.player_id).toBe('number');
    });

    it('should return first_name and last_name as strings', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      const player = response.body.result;

      expect(typeof player.first_name).toBe('string');
      expect(typeof player.last_name).toBe('string');
      expect(player.first_name.length).toBeGreaterThan(0);
      expect(player.last_name.length).toBeGreaterThan(0);
    });

    it('should return nationality as string', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      expect(typeof response.body.result.nationality).toBe('string');
      expect(response.body.result.nationality.length).toBeGreaterThan(0);
    });

    it('should return primary_position as string', async () => {
      const response = await request(app).get('/v1/players/8444894');

      expect(response.status).toBe(200);
      expect(typeof response.body.result.primary_position).toBe('string');
      expect(response.body.result.primary_position.length).toBeGreaterThan(0);
    });
  });
});

describe('GET /v1/players/nations/:nation (Integration)', () => {
  describe('Data Correctness', () => {
    it('should return players from the database with the correct structure', async () => {
      const response = await request(app).get('/v1/players/nations/CAN');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('data');
      expect(response.body.result).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });

    it('should return player objects with required fields', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=5');

      expect(response.status).toBe(200);
      const players = response.body.result.data;

      players.forEach((player: any) => {
        expect(player).toHaveProperty('player_id');
        expect(player).toHaveProperty('first_name');
        expect(player).toHaveProperty('last_name');
        expect(player).toHaveProperty('nationality');
        expect(player).toHaveProperty('primary_position');
        expect(typeof player.player_id).toBe('number');
        expect(typeof player.first_name).toBe('string');
        expect(typeof player.last_name).toBe('string');
        expect(typeof player.nationality).toBe('string');
      });
    });

    it('should return players with the requested nationality', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=5');

      expect(response.status).toBe(200);
      const players = response.body.result.data;

      players.forEach((player: any) => {
        expect(player.nationality).toBe('CAN');
      });
    });

    it('should return default limit of 10 when no limit specified', async () => {
      const response = await request(app).get('/v1/players/nations/CAN');

      expect(response.status).toBe(200);
      const players = response.body.result.data;
      expect(players.length).toBeLessThanOrEqual(10);
    });

    it('should respect custom limit parameter', async () => {
      const limit = 5;
      const response = await request(app).get(`/v1/players/nations/CAN?limit=${limit}`);

      expect(response.status).toBe(200);
      const players = response.body.result.data;
      expect(players.length).toBeLessThanOrEqual(limit);
    });

    it('should cap limit to 20 when requesting more than 20', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=50');

      expect(response.status).toBe(200);
      const players = response.body.result.data;
      expect(players.length).toBeLessThanOrEqual(20);
    });

    it('should return players in ascending order by player_id', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=20');

      expect(response.status).toBe(200);
      const players = response.body.result.data;

      for (let i = 1; i < players.length; i++) {
        expect(players[i].player_id).toBeGreaterThanOrEqual(players[i - 1].player_id);
      }
    });

    it('should provide nextCursor when more players exist', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=5');

      expect(response.status).toBe(200);
      const { nextCursor, data } = response.body.result;

      if (data.length === 5) {
        expect(nextCursor).toBeDefined();
        expect(typeof nextCursor).toBe('number');
      }
    });

    it('should return null nextCursor when at end of results', async () => {
      const firstResponse = await request(app).get('/v1/players/nations/CHE?limit=5&nextCursor=8481812');
      const firstPlayers = firstResponse.body.result.data;

      if (firstPlayers.length < 5) {
        expect(firstResponse.body.result.nextCursor).toBeNull();
      }
    });
  });

  describe('Pagination', () => {
    it('should retrieve different players using nextCursor', async () => {
      const firstResponse = await request(app).get('/v1/players/nations/CAN?limit=3');
      const firstPlayers = firstResponse.body.result.data;
      const nextCursor = firstResponse.body.result.nextCursor;

      if (nextCursor) {
        const secondResponse = await request(app).get(`/v1/players/nations/CAN?limit=3&nextCursor=${nextCursor}`);
        const secondPlayers = secondResponse.body.result.data;

        expect(secondResponse.status).toBe(200);
        expect(secondPlayers.length).toBeGreaterThan(0);

        // Players from second page should have higher IDs than first page
        const firstPageMaxId = Math.max(...firstPlayers.map((p: any) => p.player_id));
        const secondPageMinId = Math.min(...secondPlayers.map((p: any) => p.player_id));
        expect(secondPageMinId).toBeGreaterThan(firstPageMaxId);
      }
    });

    it('should handle cursor at specific player_id', async () => {
      const firstResponse = await request(app).get('/v1/players/nations/CAN?limit=2');
      const players = firstResponse.body.result.data;

      if (players.length === 2) {
        const cursorPlayerId = players[1].player_id;
        const paginatedResponse = await request(app).get(`/v1/players/nations/CAN?limit=5&nextCursor=${cursorPlayerId}`);

        expect(paginatedResponse.status).toBe(200);
        const paginatedPlayers = paginatedResponse.body.result.data;
        expect(paginatedPlayers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Query parameter validation', () => {
    it('should reject negative limit', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=-5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject negative nextCursor', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?nextCursor=-10');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-integer limit', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=5.5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-numeric limit', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject zero limit', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });
  });

  describe('Nation parameter validation', () => {
    it('should reject nation code with less than 3 letters', async () => {
      const response = await request(app).get('/v1/players/nations/CA');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject nation code with more than 3 letters', async () => {
      const response = await request(app).get('/v1/players/nations/CANA');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject nation code with special characters', async () => {
      const response = await request(app).get('/v1/players/nations/CA@');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject nation code with numbers', async () => {
      const response = await request(app).get('/v1/players/nations/CA1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept lowercase nation code and convert to uppercase', async () => {
      const response = await request(app).get('/v1/players/nations/can');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      if (response.body.result.data.length > 0) {
        expect(response.body.result.data[0].nationality).toBe('CAN');
      }
    });

    it('should accept mixed case nation code and convert to uppercase', async () => {
      const response = await request(app).get('/v1/players/nations/cAn');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      if (response.body.result.data.length > 0) {
        expect(response.body.result.data[0].nationality).toBe('CAN');
      }
    });
  });

  describe('Response format', () => {
    it('should always include success field as true for valid requests', async () => {
      const response = await request(app).get('/v1/players/nations/CAN');

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should have properly structured data object', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=1');

      expect(response.body.result).toHaveProperty('data');
      expect(response.body.result).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });

    it('should return result as array wrapper with data property', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.result).toHaveProperty('data');
      expect(response.body.result).not.toHaveProperty('player_id');
    });
  });

  describe('Data types and validation', () => {
    it('should return player_id as number', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=1');

      expect(response.status).toBe(200);
      if (response.body.result.data.length > 0) {
        expect(typeof response.body.result.data[0].player_id).toBe('number');
      }
    });

    it('should return first_name and last_name as strings', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=1');

      expect(response.status).toBe(200);
      if (response.body.result.data.length > 0) {
        const player = response.body.result.data[0];
        expect(typeof player.first_name).toBe('string');
        expect(typeof player.last_name).toBe('string');
        expect(player.first_name.length).toBeGreaterThan(0);
        expect(player.last_name.length).toBeGreaterThan(0);
      }
    });

    it('should return nationality as string matching the requested nation code', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=1');

      expect(response.status).toBe(200);
      if (response.body.result.data.length > 0) {
        expect(typeof response.body.result.data[0].nationality).toBe('string');
        expect(response.body.result.data[0].nationality).toBe('CAN');
      }
    });

    it('should return primary_position as string', async () => {
      const response = await request(app).get('/v1/players/nations/CAN?limit=1');

      expect(response.status).toBe(200);
      if (response.body.result.data.length > 0) {
        expect(typeof response.body.result.data[0].primary_position).toBe('string');
        expect(response.body.result.data[0].primary_position.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Different nationalities', () => {
    it('should return different players for different nationalities', async () => {
      const canadaResponse = await request(app).get('/v1/players/nations/CAN?limit=1');
      const usaResponse = await request(app).get('/v1/players/nations/USA?limit=1');

      expect(canadaResponse.status).toBe(200);
      expect(usaResponse.status).toBe(200);

      if (canadaResponse.body.result.data.length > 0 && usaResponse.body.result.data.length > 0) {
        const canadianPlayer = canadaResponse.body.result.data[0];
        const americanPlayer = usaResponse.body.result.data[0];

        expect(canadianPlayer.nationality).toBe('CAN');
        expect(americanPlayer.nationality).toBe('USA');
      }
    });
  });
})