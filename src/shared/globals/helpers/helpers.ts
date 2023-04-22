export class Helpers {
  static firstLetterUppercase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static lowerCase(email: string): string {
    return email.toLowerCase();
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return parseInt(result, 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJson(prop: string): any {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
}
