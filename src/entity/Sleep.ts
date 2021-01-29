import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity("Sleep")
export class Sleep {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne((type) => User)
  user?: User;

  @Column({ type: "int", default: null })
  sleepTime?: number;

  @Column({ type: "int", default: null })
  wakeTime?: number;
}
