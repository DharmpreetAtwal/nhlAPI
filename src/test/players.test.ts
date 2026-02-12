import request from 'supertest';
import { app } from '../app';
import { PlayerModel } from '../models/player';
import { mockPlayers } from './mockPlayers';

jest.mock('../models/player');

describe('GET /players/all', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid parameter values', () => {
    it('should return all players without parameters', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      });

      const response = await request(app).get('/players/all');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          data: mockPlayers,
          nextCursor: null,
        },
      });
      expect(PlayerModel.getAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return players with valid limit parameter', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers.slice(0, 5),
        nextCursor: 2,
      });

      const response = await request(app).get('/players/all?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PlayerModel.getAll).toHaveBeenCalledWith(5, undefined);
    });

    it('should cap limit to 20 when exceeding maximum', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      });

      const response = await request(app).get('/players/all?limit=50');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Verify that getAll was called with 20, not 50
      expect(PlayerModel.getAll).toHaveBeenCalledWith(20, undefined);
    });

    it('should return players with valid limit and nextCursor parameters', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: 3,
      });

      const response = await request(app).get('/players/all?limit=10&nextCursor=2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PlayerModel.getAll).toHaveBeenCalledWith(10, 2);
    });

    it('should accept valid zero value for limit', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: [],
        nextCursor: null,
      });

      const response = await request(app).get('/players/all?limit=0');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PlayerModel.getAll).toHaveBeenCalledWith(0, undefined);
    });

    it('should accept valid zero value for nextCursor', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      });

      const response = await request(app).get('/players/all?nextCursor=0');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PlayerModel.getAll).toHaveBeenCalledWith(undefined, 0);
    });
  });

  describe('Invalid limit parameter', () => {
    it('should return 400 when limit is negative', async () => {
      const response = await request(app).get('/players/all?limit=-5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is a decimal number', async () => {
      const response = await request(app).get('/players/all?limit=10.5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is not a number', async () => {
      const response = await request(app).get('/players/all?limit=abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is an empty string', async () => {
      const response = await request(app).get('/players/all?limit=');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    it('should return 400 when limit is only whitespace', async () => {
      const response = await request(app).get('/players/all?limit=%20%20%20');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    // it('should return 400 when limit is an object/array', async () => {
    //   const response = await request(app).get('/players/all?limit[0]=1');

    //   expect(response.status).toBe(400);
    //   expect(response.body.success).toBe(false);
    //   expect(response.body.message).toContain('must be a string');
    // });

    it('should return 400 when limit has special characters', async () => {
      const response = await request(app).get('/players/all?limit=12@34');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });
  });

  describe('Invalid nextCursor parameter', () => {
    it('should return 400 when nextCursor is negative', async () => {
      const response = await request(app).get('/players/all?nextCursor=-10');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is a decimal number', async () => {
      const response = await request(app).get('/players/all?nextCursor=5.99');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is not a number', async () => {
      const response = await request(app).get('/players/all?nextCursor=xyz');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is an empty string', async () => {
      const response = await request(app).get('/players/all?nextCursor=');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    it('should return 400 when nextCursor is only whitespace', async () => {
      const response = await request(app).get('/players/all?nextCursor=%20%20');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    // it('should return 400 when nextCursor is an object/array', async () => {
    //   const response = await request(app).get('/players/all?nextCursor[0]=5');

    //   expect(response.status).toBe(400);
    //   expect(response.body.success).toBe(false);
    //   expect(response.body.message).toContain('must be a string');
    // });

    it('should return 400 when nextCursor has special characters', async () => {
      const response = await request(app)
        .get('/players/all')
        .query({ nextCursor: '123#456' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });
  });

  describe('Invalid combinations', () => {
    it('should return 400 when both limit and nextCursor are invalid', async () => {
      const response = await request(app).get('/players/all?limit=abc&nextCursor=xyz');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when limit is valid but nextCursor is invalid', async () => {
      const response = await request(app).get('/players/all?limit=10&nextCursor=-5');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('nextCursor');
    });

    it('should return 400 when limit is invalid but nextCursor is valid', async () => {
      const response = await request(app).get('/players/all?limit=abc&nextCursor=10');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('limit');
    });
  });
});
