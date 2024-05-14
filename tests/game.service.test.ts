import { MongooseAdapter } from "../repository/mongoose.adapter";
import { GameService } from "../services/game.service";
import { errorUserHasAlreadyPlayedOrwin } from "../errors/errors";
import mongoose from "mongoose";

const usermail = "test@test.net"
const password = process.env.MONGOPASSWORD;
const username = process.env.MONGOUSERNAME;
const mongoUri = `mongodb://${username}:${password}@127.0.0.1:27017/yams?authSource=admin`;
beforeEach(async () => {
    await mongoose.connect(mongoUri);
    await MongooseAdapter.deleteWinner(usermail);
    await MongooseAdapter.deleteGame(usermail);
});

afterEach(async () => {
    await mongoose.disconnect();
  });

test('Get results returns winner', async () => {
    
    // inserts winner
    await MongooseAdapter.insertWinner(usermail, 1);

    // gets winner
    const winners = await GameService.getResults();

    // expects winner to be given
    expect(winners.length).toBeGreaterThan(0);
  });

// roll dices tests
test('Roll dices vanilla case', async () => {
    const result = await GameService.rollDices({email: usermail});
    expect(result.error).toBe(undefined);
    expect(result.success).toBe("ok");
    expect(result.dice.length).toBe(5);
    
});

test('Roll dices user has already won', async () => {
    // inserts user in winners
    await MongooseAdapter.insertWinner(usermail, 1);

    // rolls dices
    const result = await GameService.rollDices({email: usermail});
    expect(result.error).toBe(errorUserHasAlreadyPlayedOrwin);
    expect(result.success).toBe(undefined);
    expect(result.dice.length).toBe(0);

    // deletes user of the winners
    await MongooseAdapter.deleteWinner(usermail);
});

test('Roll dices user has already played thrice', async () => {
    for(let i = 0; i < 3; i++){
        // create game
        await MongooseAdapter.createGameOrUpdateGame(usermail, [])
    }
    const result = await GameService.rollDices({email: usermail})
    expect(result.error).toBe(errorUserHasAlreadyPlayedOrwin)
    expect(result.success).toBe(undefined)
    expect(result.dice.length).toBe(0)
});