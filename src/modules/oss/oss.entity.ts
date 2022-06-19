import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('oss')
export class OssEntity {

    @PrimaryGeneratedColumn({type: 'bigint'})
    id: number;

    @Column({comment: '文件名'})
    name: string;

    @Column({comment: '文件路径'})
    url: string;

    @Column({comment: '文件类型'})
    type: string;

    @Column({comment: '文件大小byte'})
    size: number;

    @Column({comment: '文件上传人'})
    owner: string;

    @CreateDateColumn({comment: '创建时间'})
    create_time: Date;
}
