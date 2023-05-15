import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import {
  UserStraightInfo,
  UserInput,
  UserOutput,
  NewOrChangeUserInput,
} from '../users/users.model';
import { UsersService } from '../users/users.service';

const KEY = process.env.SECRET_KEY;
const AES_PASSWORD = process.env.AES_PASSWORD;
const IV_KEY = randomBytes(16);

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: UserInput): Promise<UserOutput | null> {
    const existingUser = await this.isValidate(user.username, user.password);
    if (!existingUser) return null;
    const jwt = await this.jwtService.signAsync({ user });
    return {
      id: existingUser.id,
      username: existingUser.username,
      token: jwt,
    };
  }

  async createUser(
    user: NewOrChangeUserInput,
  ): Promise<UserStraightInfo | null> {
    const existingUser = await this.userService.findByName(user.username);
    if (existingUser || user.key !== KEY) return null;

    const hashedPassword = await this.passwordEncryption(user.password);
    const newUser = await this.userService.createUser(
      user.username,
      hashedPassword,
    );
    return newUser;
  }

  async passwordChanger(
    user: NewOrChangeUserInput,
  ): Promise<UserStraightInfo | null> {
    const existingUser = await this.isValidateForChange(
      user.username,
      user.key,
    );
    if (!existingUser) return null;
    const newHashedPassword = await this.passwordEncryption(user.password);
    const userUpdated: UserStraightInfo = await this.userService.updateUser(
      user.username,
      newHashedPassword,
    );
    return userUpdated;
  }

  async passwordEncryption(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const passwordHashed = await bcrypt.hash(password, salt);

    return passwordHashed;
  }

  async isPasswordTrue(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async isValidateForChange(
    username: string,
    key: string,
  ): Promise<UserStraightInfo | null> {
    try {
      const foundUser = await this.userService.findByName(username);
      const isExisting = !!foundUser;
      const isKeyTrue = key === KEY;

      if (!isKeyTrue || !isExisting) return null;

      return {
        id: foundUser._id,
        username: foundUser.username,
      };
    } catch {
      throw new UnauthorizedException('Key or username are invalid!');
    }
  }

  async isValidate(
    username: string,
    password: string,
  ): Promise<UserStraightInfo | null> {
    try {
      const foundUser = await this.userService.findByName(username);
      const isExisting = !!foundUser;
      const isPasswordTrue = await this.isPasswordTrue(
        foundUser.password,
        password,
      );

      if (!isPasswordTrue || !isExisting) return null;

      return {
        id: foundUser._id,
        username: foundUser.username,
      };
    } catch {
      throw new UnauthorizedException(
        'Hasło lub nazwa użytownika są nieprawidłowe!',
      );
    }
  }

  encrypt(text: string): string {
    console.log(Buffer.from(AES_PASSWORD).length);
    const cipher = createCipheriv(
      'aes-256-cbc',
      Buffer.from(AES_PASSWORD),
      IV_KEY,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${IV_KEY.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(text: string): string {
    const [iv, encrypted] = text
      .split(':')
      .map((hex) => Buffer.from(hex, 'hex'));
    const decipher = createDecipheriv(
      'aes-256-cbc',
      Buffer.from(AES_PASSWORD),
      iv,
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
