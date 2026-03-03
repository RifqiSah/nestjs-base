import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'keywords' })
export class Keyword {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mongo_id: string;

  @Column('jsonb')
  reward_catalog: object;

  @Column('jsonb')
  eligibility: object;

  @Column('jsonb')
  bonus: object;

  @Column('jsonb')
  notification: object;

  @Column()
  keyword_approval: string;

  @Column('boolean')
  is_draft: boolean;

  @Column('boolean')
  need_review_after_edit: boolean;

  @Column('jsonb')
  created_by: object;

  @Column({ nullable: true })
  hq_approver: string;

  @Column({ nullable: true })
  non_hq_approver: string;

  @Column('boolean')
  is_main_keyword: boolean;

  @Column('jsonb')
  child_keyword: object;

  @Column({ nullable: true })
  keyword_edit: string;

  @Column('boolean')
  is_stoped: boolean;

  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
