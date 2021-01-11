

export interface CreatePasswordResponse {
    passwordRO: {
        password: string;
        description: string;
        id: string | number;
        created: string | Date;
    }
}
