package com.quita.api.complaint.pdf;

import com.quita.api.complaint.model.Complaint;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class DocumentIdentifierGeneratorTest {

    @Test
    void shouldGenerateCorrectIdentifier() {
        UUID uuid = UUID.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d479"); // Last 6 chars: b2c3d479 -> replace '-' -> last 6 chars: "2c3d49" (wait: 0e02b2c3d479 -> length 12 -> last 6 is B2C3D4)
        // Wait, replace("-") makes it "f47ac10b58cc4372a5670e02b2c3d479" -> length 32 -> last 6 is "2C3D79"
        Complaint complaint = Complaint.builder()
                .id(uuid)
                .createdAt(LocalDateTime.of(2026, 6, 16, 9, 48))
                .build();

        String code = DocumentIdentifierGenerator.generate(complaint);
        assertEquals("QT-20260616-C3D479", code);
    }

    @Test
    void shouldReturnDefaultIfComplaintIsNull() {
        String code = DocumentIdentifierGenerator.generate(null);
        assertEquals("QT-00000000-000000", code);
    }
}
