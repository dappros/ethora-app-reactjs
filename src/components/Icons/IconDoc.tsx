interface Props {
    width?: number
    height?: number
}

export function IconDoc({ width = 16, height = 20 }: Props) {
    return (
        <svg width={width} height={height} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75 1.25V4.75C9.75 5.21413 9.93438 5.65925 10.2626 5.98744C10.5908 6.31563 11.0359 6.5 11.5 6.5H15M10.625 1.25H2.75C2.28587 1.25 1.84075 1.43437 1.51256 1.76256C1.18437 2.09075 1 2.53587 1 3V17C1 17.4641 1.18437 17.9092 1.51256 18.2374C1.84075 18.5656 2.28587 18.75 2.75 18.75H13.25C13.7141 18.75 14.1592 18.5656 14.4874 18.2374C14.8156 17.9092 15 17.4641 15 17V5.625L10.625 1.25Z" stroke="#0052CD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}
