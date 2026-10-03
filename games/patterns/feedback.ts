export const TRY_AGAIN = ["Hmm, try another one!", "Not that one. Look again!", "Almost! Try again.", "Good try! Look at what changes."];
export const NICE = ["Yes!", "Correct!", "Great thinking!", "You got it!", "Super!"];

export function line(list: string[], n: number) {
  return list[n % list.length];
}
