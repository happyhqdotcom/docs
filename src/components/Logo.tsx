import wordmark from '@/images/wordmark.svg'

type LogoProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

export function Logo(props: LogoProps) {
  return (
    <img
      alt="HappyHQ"
      width={wordmark.width}
      height={wordmark.height}
      {...props}
      src={wordmark.src}
    />
  )
}
