import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'กรุณาระบุ title' });
    }

    const task = await prisma.task.create({
      data: { title, description },
    });

    res.status(201).json({ data: task });
  } catch (err) {
    console.error('CREATE error:', err);
    res.status(500).json({ message: 'ไม่สามารถสร้างงานได้' });
  }
});

// READ ALL
router.get('/', async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: tasks });
  } catch (err) {
    console.error('READ ALL error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงรายการได้' });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ message: 'ไม่พบงาน' });
    }

    res.json({ data: task });
  } catch (err) {
    console.error('READ ONE error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
  }
});

// UPDATE (PATCH)
router.patch('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({ data: task });
  } catch (err: any) {
    console.error('UPDATE error:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'ไม่พบงานที่ต้องการอัปเดต' });
    }

    res.status(500).json({ message: 'ไม่สามารถอัปเดตได้' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'ลบงานสำเร็จ' });
  } catch (err: any) {
    console.error('DELETE error:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'ไม่พบงานที่ต้องการลบ' });
    }

    res.status(500).json({ message: 'ไม่สามารถลบได้' });
  }
});

export default router;
