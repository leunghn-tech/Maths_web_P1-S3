/** Maths Quest 分數排版：以小學慣用的上下分子／分母形式，融入手帳式題面。 */
import { Fragment } from "react";

type Props = { value: string; className?: string };
const fractionPattern = /(\d+)\/(\d+)/g;

export default function FractionText({ value, className }: Props) {
  const tokens = value.split(fractionPattern);
  return <span className={className}>{tokens.map((token, index) => {
    if (index % 3 === 1) {
      const denominator = tokens[index + 1];
      return <span key={`${token}-${denominator}-${index}`} className="mq-fraction" aria-label={`${token} 分之 ${denominator}`}><sup>{token}</sup><sub>{denominator}</sub></span>;
    }
    if (index % 3 === 2) return null;
    return <Fragment key={`${token}-${index}`}>{token}</Fragment>;
  })}</span>;
}
