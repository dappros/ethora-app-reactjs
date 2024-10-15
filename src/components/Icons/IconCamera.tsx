interface Props {
    width?: number
    height?: number
}

export function IconCamera({ width = 24, height = 24 }: Props) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 7.00001L17.5 7.003M5.95723 4H18C20.2091 4 21.25 4.79086 21.25 7V17C21.25 19.2091 20.2091 20 18 20H5.95723C3.74809 20 2.75 19.2091 2.75 17V7C2.75 4.79086 3.74809 4 5.95723 4ZM15.75 12.5C15.75 14.5711 14.0711 16.25 12 16.25C9.92893 16.25 8.25 14.5711 8.25 12.5C8.25 10.4289 9.92893 8.75 12 8.75C14.0711 8.75 15.75 10.4289 15.75 12.5Z" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

