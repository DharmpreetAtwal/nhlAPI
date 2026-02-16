import request from 'supertest';
import { app } from '../../app';

describe('GET /v1/players/all (Integration)', () => {
  describe('Data correctness', () => {
    it('should return players from database with correct structure', async () => {
      const response = await request(app).get('/v1/players/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return player objects with required fields', async () => {
      const response = await request(app).get('/v1/players/all?limit=5');

      expect(response.status).toBe(200);
      const players = response.body.data.data;

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
      const players = response.body.data.data;
      expect(players.length).toBeLessThanOrEqual(10);
    });

    it('should respect custom limit parameter', async () => {
      const limit = 5;
      const response = await request(app).get(`/v1/players/all?limit=${limit}`);

      expect(response.status).toBe(200);
      const players = response.body.data.data;
      expect(players.length).toBeLessThanOrEqual(limit);
    });

    it('should cap limit to 20 when requesting more than 20', async () => {
      const response = await request(app).get('/v1/players/all?limit=50');

      expect(response.status).toBe(200);
      const players = response.body.data.data;
      expect(players.length).toBeLessThanOrEqual(20);
    });

    it('should return players in ascending order by player_id', async () => {
      const response = await request(app).get('/v1/players/all?limit=20');

      expect(response.status).toBe(200);
      const players = response.body.data.data;

      for (let i = 1; i < players.length; i++) {
        expect(players[i].player_id).toBeGreaterThanOrEqual(players[i - 1].player_id);
      }
    });

    it('should provide nextCursor when more players exist', async () => {
      const response = await request(app).get('/v1/players/all?limit=5');

      expect(response.status).toBe(200);
      const { nextCursor, data } = response.body.data;

      if (data.length === 5) {
        expect(nextCursor).toBeDefined();
        expect(typeof nextCursor).toBe('number');
      }
    });

    it('should return null nextCursor when at end of results', async () => {
      const firstResponse = await request(app).get('/v1/players/all?limit=5');
      const firstPlayers = firstResponse.body.data.data;

      if (firstPlayers.length < 5) {
        expect(firstResponse.body.data.nextCursor).toBeNull();
      }
    });
  });

  describe('Pagination', () => {
    it('should retrieve different players using nextCursor', async () => {
      const firstResponse = await request(app).get('/v1/players/all?limit=3');
      const firstPlayers = firstResponse.body.data.data;
      const nextCursor = firstResponse.body.data.nextCursor;

      if (nextCursor) {
        const secondResponse = await request(app).get(`/v1/players/all?limit=3&nextCursor=${nextCursor}`);
        const secondPlayers = secondResponse.body.data.data;

        expect(secondResponse.status).toBe(200);
        expect(secondPlayers.length).toBeGreaterThan(0);

        // Players from second page should have higher IDs than first page
        const firstPageMaxId = Math.max(...firstPlayers.map((p: any) => p.player_id));
        const secondPageMinId = Math.min(...secondPlayers.map((p: any) => p.player_id));
        expect(secondPageMinId).toBeGreaterThan(firstPageMaxId);
      }
    });

    it('should handle zero limit correctly', async () => {
      const response = await request(app).get('/v1/players/all?limit=0');

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.nextCursor).toBeNull();
    });

    it('should handle cursor at specific player_id', async () => {
      const firstResponse = await request(app).get('/v1/players/all?limit=2');
      const players = firstResponse.body.data.data;

      if (players.length === 2) {
        const cursorPlayerId = players[1].player_id;
        const paginatedResponse = await request(app).get(`/v1/players/all?limit=5&nextCursor=${cursorPlayerId}`);

        expect(paginatedResponse.status).toBe(200);
        const paginatedPlayers = paginatedResponse.body.data.data;
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
  });

  describe('Response format', () => {
    it('should always include success field as true for valid requests', async () => {
      const response = await request(app).get('/v1/players/all');

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should have properly structured data object', async () => {
      const response = await request(app).get('/v1/players/all?limit=1');

      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });
  });
});
