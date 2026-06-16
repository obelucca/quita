package com.quita.api.complaint.pdf;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class QuitaPdfOptionsTest {

    @Test
    void shouldHaveCorrectDefaultValues() {
        QuitaPdfOptions options = new QuitaPdfOptions();
        assertFalse(options.isShowCover());
        assertTrue(options.isShowWatermark());
        assertTrue(options.isShowFooter());
        assertTrue(options.isShowDocId());
        assertTrue(options.isShowEditorialSeal());
        assertTrue(options.isShowHighlights());
    }

    @Test
    void shouldAllowCustomValuesViaBuilder() {
        QuitaPdfOptions options = QuitaPdfOptions.builder()
                .showCover(true)
                .showWatermark(false)
                .showFooter(false)
                .showDocId(false)
                .showEditorialSeal(false)
                .showHighlights(false)
                .build();
        assertTrue(options.isShowCover());
        assertFalse(options.isShowWatermark());
        assertFalse(options.isShowFooter());
        assertFalse(options.isShowDocId());
        assertFalse(options.isShowEditorialSeal());
        assertFalse(options.isShowHighlights());
    }
}
