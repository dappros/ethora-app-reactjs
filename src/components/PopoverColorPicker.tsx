import { HexColorPicker} from "react-colorful";
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import "./PopoverColorPicker.scss"

interface Props {
    color: string
    onChange: (color: string) => void
}

export const PopoverColorPicker = ({color, onChange}: Props) => {
    return (
        <Popover className="popover-color-picker">
            <PopoverButton className="color-button" >
                <div className="left" style={{backgroundColor: color}}></div>
                <div className="right">
                </div>
            </PopoverButton>

          <PopoverPanel focus={true} anchor="bottom" className="flex flex-col">
            <HexColorPicker color={color} onChange={(color) => {
                onChange(color)
            }} />
          </PopoverPanel>
        </Popover>
    )
};
