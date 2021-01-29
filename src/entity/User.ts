import typeorm, {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Sleep } from "./Sleep";

@Entity("User")
export class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "text", default: null })
  discordId?: string;

  @Column({ type: "boolean", default: false })
  nowSleeping: boolean;

  @Column({ type: "int", default: null })
  sleepTempTime: number;

  @OneToMany((type) => Sleep, (sleep) => sleep.user)
  sleeps?: Sleep[];
}
