import { Directive, ElementRef, Renderer2, AfterViewInit, Input } from "@angular/core";

@Directive({
    selector: "[mydpfocus]"
})

export class FocusDirective implements AfterViewInit {
    @Input("mydpfocus") value: string;

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    // Focus to element: if value 0 = don't set focus, 1 = set focus
    ngAfterViewInit() {
        if (this.value === "0") {
            return;
        }
        this.renderer.selectRootElement(this.el.nativeElement).focus();
    }
}