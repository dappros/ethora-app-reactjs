interface Props {
    width?: number
    height?: number
}

export function IconInfo({ width = 15, height = 15 }: Props) {
    return (
        <svg width={width} height={height} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33464 10.6667V8.00004M7.33464 5.33337H7.3413M14.0013 8.00004C14.0013 11.6819 11.0165 14.6667 7.33464 14.6667C3.65274 14.6667 0.667969 11.6819 0.667969 8.00004C0.667969 4.31814 3.65274 1.33337 7.33464 1.33337C11.0165 1.33337 14.0013 4.31814 14.0013 8.00004Z" stroke="#8C8C8C" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
