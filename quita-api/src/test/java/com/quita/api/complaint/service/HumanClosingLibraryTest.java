package com.quita.api.complaint.service;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class HumanClosingLibraryTest {

    private final HumanClosingLibrary library = new HumanClosingLibrary();

    @Test
    public void testGetClosings() {
        List<String> closings = library.getClosings();
        assertNotNull(closings);
        assertEquals(3, closings.size());
        assertTrue(closings.get(0).contains("compreensão da obrigação") || closings.get(0).contains("recebimento"));
    }

    @Test
    public void testSelectClosingDeterministic() {
        String seed = "test-seed-xyz";
        String closing1 = library.selectClosing(seed);
        String closing2 = library.selectClosing(seed);
        assertEquals(closing1, closing2);
        assertNotNull(closing1);
    }
}
