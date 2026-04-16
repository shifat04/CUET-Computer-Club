jest.mock('../models/Card', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
}));

const Card = require('../models/Card');
const { createCard, getCards, updateCard, deleteCard } = require('../controllers/cardController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

describe('Card CRUD operations', () => {
    it('creates and returns a card', async () => {
        Card.create.mockResolvedValue({ _id: 'c1', title: 'T', description: 'D', features: ['A'] });
        const req = { body: { title: 'T', description: 'D', features: 'A' } };
        const res = mockRes();

        await createCard(req, res);

        expect(Card.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('updates and deletes an existing card', async () => {
        const savedCard = {
            _id: 'c2',
            icon: '💻',
            title: 'Old',
            description: 'Old',
            features: [],
            save: jest.fn().mockResolvedValue({ _id: 'c2', title: 'New' }),
            deleteOne: jest.fn().mockResolvedValue(undefined),
        };
        Card.findById.mockResolvedValue(savedCard);

        const updateReq = { params: { id: 'c2' }, body: { title: 'New' } };
        const updateRes = mockRes();
        await updateCard(updateReq, updateRes);
        expect(updateRes.status).toHaveBeenCalledWith(200);

        const deleteReq = { params: { id: 'c2' } };
        const deleteRes = mockRes();
        await deleteCard(deleteReq, deleteRes);
        expect(deleteRes.status).toHaveBeenCalledWith(200);
    });

    it('lists cards sorted by created date', async () => {
        const sort = jest.fn().mockResolvedValue([{ _id: 'c3' }]);
        Card.find.mockReturnValue({ sort });

        const res = mockRes();
        await getCards({}, res);

        expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
