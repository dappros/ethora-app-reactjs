interface Props {
    width?: number
    height?: number
}

export function IconArrowDown({width = 24, height = 24}: Props) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 8.7002L12 15.2002L18.5 8.7002" stroke="#8C8C8C" stroke-width="2" stroke-linecap="round"/>
        </svg>
    )
}
