package com.quita.api.complaint.pdf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuitaPdfOptions {
    @Builder.Default
    private boolean showCover = false;
    
    @Builder.Default
    private boolean showWatermark = true;
    
    @Builder.Default
    private boolean showFooter = true;
    
    @Builder.Default
    private boolean showDocId = true;
    
    @Builder.Default
    private boolean showEditorialSeal = true;
    
    @Builder.Default
    private boolean showHighlights = true;
}
