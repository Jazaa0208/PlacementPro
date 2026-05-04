"""Added avatar field

Revision ID: b86cfdd9ddb3
Revises: 9ab64ba4547d
Create Date: 2026-05-04 20:40:31.790108
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'b86cfdd9ddb3'
down_revision = '9ab64ba4547d'
branch_labels = None
depends_on = None


def upgrade():
    # ONLY add avatar column (DO NOT DROP ANY TABLES)
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('avatar', sa.Text(), nullable=True))


def downgrade():
    # Remove avatar column if rolled back
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('avatar')