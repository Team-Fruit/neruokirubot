import { getRepository } from 'typeorm';
import { Sleep } from './entities/Sleep'
import { User } from './entities/User'

export const Sleeps = getRepository(Sleep);
export const Users = getRepository(User);
