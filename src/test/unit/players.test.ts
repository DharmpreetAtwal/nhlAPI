import request from 'supertest';
import { app } from '../../app';
import { PlayerModel } from '../../models/player';
import { mockPlayers } from '../mockPlayers';

jest.mock('../../models/player');
jest.mock('../../config/prisma', () => ({
  prisma: {
    session: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '../../config/prisma';

// Helper function to create an authenticated request
const createAuthenticatedRequest = (token = 'valid-test-token') => {
  const mockSession = {
    token,
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
    },
  };
  
  (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
  return token;
};

describe('GET /v1/players/all', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAuthenticatedRequest();
  });

  describe('Valid parameter values', () => {
    it('should return all players without parameters', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      });

      const response = await request(app)
        .get('/v1/players/all')
        .set('Authorization', `Bearer valid-test-token`);
        
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        result: {
          data: mockPlayers,
          nextCursor: null,
        }
      })
      expect(PlayerModel.getAll).toHaveBeenCalledWith(10, undefined);
    });

    it('should return players with valid limit parameter', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers.slice(0, 5),
        nextCursor: 2,
      });

      const response = await request(app)
        .get('/v1/players/all?limit=5')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PlayerModel.getAll).toHaveBeenCalledWith(5, undefined);
    });

    it('should cap limit to 20 when exceeding maximum', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      });

      const response = await request(app)
        .get('/v1/players/all?limit=50')
        .set('Authorization', `Bearer valid-test-token`);

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

      const response = await request(app)
        .get('/v1/players/all?limit=10&nextCursor=2')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PlayerModel.getAll).toHaveBeenCalledWith(10, 2);
    });
  });

  describe('Invalid limit parameter', () => {
    it('should return 400 when limit is negative', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=-5')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is a decimal number', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=10.5')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is not a number', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=abc')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is an empty string', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    it('should return 400 when limit is only whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=%20%20%20')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    // it('should return 400 when limit is an object/array', async () => {
    //   const response = await request(app).get('/v1/players/all?limit[0]=1');

    //   expect(response.status).toBe(400);
    //   expect(response.body.success).toBe(false);
    //   expect(response.body.message).toContain('must be a string');
    // });

    it('should return 400 when limit has special characters', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=12@34')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when limit is 0', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: [],
        nextCursor: null,
      });

      const response = await request(app)
        .get('/v1/players/all?limit=0')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });
  });

  describe('Invalid nextCursor parameter', () => {
    it('should return 400 when nextCursor is negative', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=-10')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is a decimal number', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=5.99')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is not a number', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=xyz')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is an empty string', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    it('should return 400 when nextCursor is only whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=%20%20')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be empty');
    });

    // it('should return 400 when nextCursor is an object/array', async () => {
    //   const response = await request(app).get('/v1/players/all?nextCursor[0]=5');

    //   expect(response.status).toBe(400);
    //   expect(response.body.success).toBe(false);
    //   expect(response.body.message).toContain('must be a string');
    // });

    it('should return 400 when nextCursor has special characters', async () => {
      const response = await request(app)
        .get('/v1/players/all')
        .set('Authorization', `Bearer valid-test-token`)
        .query({ nextCursor: '123#456' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });

    it('should return 400 when nextCursor is 0', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      });

      const response = await request(app)
        .get('/v1/players/all?nextCursor=0')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive integer');
    });
  });

  describe('Invalid combinations', () => {
    it('should return 400 when both limit and nextCursor are invalid', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=abc&nextCursor=xyz')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when limit is valid but nextCursor is invalid', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=10&nextCursor=-5')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('nextCursor');
    });

    it('should return 400 when limit is invalid but nextCursor is valid', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=abc&nextCursor=10')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('limit');
    });
  });
});

describe('GET /v1/players/nations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAuthenticatedRequest();
  })

  describe('Valid parameter values', () => {
    it('should return all Canadian players without parameters', async () => {
      const players = mockPlayers.filter((player) => player.nationality === "CAN");
      (PlayerModel.getByNationality as jest.Mock).mockResolvedValue({
        data: players,
        nextCursor: null,
      });

      const response = await request(app)
        .get('/v1/players/nations/CAN')
        .set('Authorization', `Bearer valid-test-token`);

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        result: {
          data: players,
          nextCursor: null,
        }
      })
      
      expect(PlayerModel.getByNationality).toHaveBeenCalledWith("CAN", 10, undefined)
    })

    it('should return Canadian players with valid limit parameter', async () => {
      const players = mockPlayers.filter((player) => player.nationality === "CAN");
      (PlayerModel.getByNationality as jest.Mock).mockResolvedValue({
        data: players,
        nextCursor: null
      });

      const response = await request(app)
        .get("/v1/players/nations/CAN?limit=2")
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        result: {
          data: players,
          nextCursor: null,
        },
      })
      expect(PlayerModel.getByNationality).toHaveBeenCalledWith("CAN", 2, undefined)
    })

    it('should cap limit to 20 when exceeding maximum', async () => {
      const players = mockPlayers.filter((player) => player.nationality === "USA");
      (PlayerModel.getByNationality as jest.Mock).mockResolvedValue({
        data: players,
        nextCursor: null
      })

      const response = await request(app)
        .get("/v1/players/nations/USA?limit=50")
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        result: {
          data: players,
          nextCursor: null
        }
      })
      expect(PlayerModel.getByNationality).toHaveBeenCalledWith("USA", 20, undefined)
    })

    it('should accept nations with any casing', async () => {
      const players = mockPlayers.filter((player) => player.nationality === "USA");
      (PlayerModel.getByNationality as jest.Mock).mockResolvedValue({
        data: players,
        nextCursor: null
      })

      const response = await request(app)
        .get("/v1/players/nations/usA")
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        result: {
          data: players,
          nextCursor: null
        }
      })
      expect(PlayerModel.getByNationality).toHaveBeenCalledWith("USA", 10, undefined)
    })

    it('should return players with valid limit and nextCursor parameters', async () => {
      const players = mockPlayers.filter((player) => player.nationality === "CAN");
      (PlayerModel.getByNationality as jest.Mock).mockResolvedValue({
        data: players,
        nextCursor: 3
      })

      const response = await request(app)
        .get("/v1/players/nations/CAN?limit=10&nextCursor=2")
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        result: {
          data: players,
          nextCursor: 3
        }
      })
      expect(PlayerModel.getByNationality).toHaveBeenCalledWith("CAN", 10, 2)
    })
  })

  describe('Invalid nation parameter', () => {
    it('should return 400 when nation is empty', async () => {
      const response = await request(app)
        .get('/v1/players/nations/')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.message).toContain('nation cannot be undefined')
    })

    it('should return 400 when nation contains special characters', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CA@')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('must be 3 letters')
    })

    it('should return 400 when nation has numbers', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CA1')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('must be 3 letters')
    })

    it('should return 400 when nation has whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CA%20N')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('must be 3 letters')
    })

    it('should return 400 when nation is too long', async () => {
      const response = await request(app)
        .get('/v1/players/nations/TOOLONG')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should return 400 when nation is too short', async () => {
      const response = await request(app)
        .get('/v1/players/nations/C')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Invalid limit parameter', () => {
    it('should return 400 when limit is negative', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=-5')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is a decimal number', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=10.5')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is not a number', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=abc')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is an empty string', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when limit is only whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=%20%20%20')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when limit has special characters', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=12@34')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })
  })

  describe('Invalid nextCursor parameter', () => {
    it('should return 400 when nextCursor is negative', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?nextCursor=-10')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is a decimal number', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?nextCursor=5.99')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is not a number', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?nextCursor=xyz')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is an empty string', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?nextCursor=')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when nextCursor is only whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?nextCursor=%20%20')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when nextCursor has special characters', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?nextCursor=123%23456')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is 0', async () => {
      const players = mockPlayers.filter((player) => player.nationality === "USA");
      (PlayerModel.getByNationality as jest.Mock).mockResolvedValue({
        data: players,
        nextCursor: null
      })

      const response = await request(app)
        .get("/v1/players/nations/USA?nextCursor=0")
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })
  })

  describe('Invalid combinations', () => {
    it('should return 400 when both limit and nextCursor are invalid', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=abc&nextCursor=xyz')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should return 400 when limit is valid but nextCursor is invalid', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=10&nextCursor=-5')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('nextCursor')
    })

    it('should return 400 when limit is invalid but nextCursor is valid', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CAN?limit=abc&nextCursor=10')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('limit')
    })

    it('should return 400 when nation is invalid but limit and nextCursor are valid', async () => {
      const response = await request(app)
        .get('/v1/players/nations/CA1?limit=5&nextCursor=2')
        .set('Authorization', `Bearer valid-test-token`)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('must be 3 letters')
    })
  })
})

describe('GET /v1/players/all', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAuthenticatedRequest();
  })

  describe('Valid parameter values', () => {
    it('should return all players without parameters', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      })

      const response = await request(app)
        .get('/v1/players/all')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        result: {
          data: mockPlayers,
          nextCursor: null,
        },
      })
      expect(PlayerModel.getAll).toHaveBeenCalledWith(10, undefined)
    })

    it('should return players with valid limit parameter', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers.slice(0, 5),
        nextCursor: 2,
      })

      const response = await request(app)
        .get('/v1/players/all?limit=5')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(PlayerModel.getAll).toHaveBeenCalledWith(5, undefined)
    })

    it('should cap limit to 20 when exceeding maximum', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      })

      const response = await request(app)
        .get('/v1/players/all?limit=50')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(PlayerModel.getAll).toHaveBeenCalledWith(20, undefined)
    })

    it('should return players with valid limit and nextCursor parameters', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers.slice(0, 10),
        nextCursor: 3,
      })

      const response = await request(app)
        .get('/v1/players/all?limit=10&nextCursor=2')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(PlayerModel.getAll).toHaveBeenCalledWith(10, 2)
    })

  })

  describe('Invalid limit parameter', () => {
    it('should return 400 when limit is negative', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=-5')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is a decimal number', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=10.5')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is not a number', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=abc')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is an empty string', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when limit is only whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=%20%20%20')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when limit has special characters', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=12@34')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when limit is 0', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: [],
        nextCursor: null,
      })

      const response = await request(app)
        .get('/v1/players/all?limit=0')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })
  })

  describe('Invalid nextCursor parameter', () => {
    it('should return 400 when nextCursor is negative', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=-10')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is a decimal number', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=5.99')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is not a number', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=xyz')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is an empty string', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when nextCursor is only whitespace', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=%20%20')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('cannot be empty')
    })

    it('should return 400 when nextCursor has special characters', async () => {
      const response = await request(app)
        .get('/v1/players/all?nextCursor=123%23456')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })

    it('should return 400 when nextCursor is 0', async () => {
      (PlayerModel.getAll as jest.Mock).mockResolvedValue({
        data: mockPlayers,
        nextCursor: null,
      })

      const response = await request(app)
        .get('/v1/players/all?nextCursor=0')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('positive integer')
    })
  })

  describe('Invalid combinations', () => {
    it('should return 400 when both limit and nextCursor are invalid', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=abc&nextCursor=xyz')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should return 400 when limit is valid but nextCursor is invalid', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=10&nextCursor=-5')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('nextCursor')
    })

    it('should return 400 when limit is invalid but nextCursor is valid', async () => {
      const response = await request(app)
        .get('/v1/players/all?limit=abc&nextCursor=10')
        .set('Authorization', `Bearer valid-test-token`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('limit')
    })
  })
})